const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

// defining the userSchema
/*VVI-  we need to use the"new" keyword because schema here is a constructor of Schema class, in order to call the
 constructor and create a new object of this schema class we need to use the new keyword*/
// schema ek tarike ka "class constructor" hi hai
// vvi-    To instantiate a class we use the new keyword and the name of the class, and when we are using the parenthesis
// we are basically calling the constructor of the class
const user_schema = new mongoose.Schema({
  Fullname: {
    type: String,
    required: [true, "Please enter your name"],
    maxlength: [50, "name should not be longer than 50 characters"], // this kind of data validatiors can be used with the data type String only
    minlength: [3, "minimum length of the name is 3 characters"],
    trim: true,
  },
  Email: {
    type: String,
    unique: true, // it is technically  not a data validator, despite it throws an error when you try to duplicate the email
    required: true,
    lowercase: true, // it is not a validator, just it will convert the input of the user to lowercase
    validate: [validator.isEmail, "please enter a valid email"],
  },
  Password: {
    type: String, // we specified the type as "String" because here we will be storing the path of the photo where it is stored
    required: true,
    minlength: 8,
    select: false,
  },
  PhoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return validator.isMobilePhone(String(value));
      },
      message: "Please enter a valid phone number",
    },
    //   //this kind of data validators can be used with data types Number or Date
    //   // max:
    //   // min: ,
  },
  Image: {
    type: String,
    default:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  createdon: {
    type: Date,
    default: Date.now(),
    select: false,
    /* When you specify select: false for a field in a Mongoose schema, it means that by default,
    that field will not be included in query results unless explicitly specified.
     It doesn't prevent the field from being saved in the database; instead, 
     it determines whether the field will be included when querying the database.
     */
  },
  ConfirmPassword: {
    type: String,
    required: [true, "confirm password is a required field"],
    // below  we are creating a custom validator
    validate: {
      // This validator will only work for save() and create() methods (not for any other methods like findoneandUpdate() etc)
      validator: function (value) {
        return value === this.Password; // this keyword here is pointing to the current document and on that document we have the password field
        // the above piece of code will return a boolean value
      },
      message: "Password and confirm password doest not match",
    },
  },
});
/* for hashing or encrypting the password we are going to use the mongoose pre hook (works before you are saving/creating document) document middleware(document middleware)
 here before saving the password field we are going to encrypt it and then save it in the database,
 the point to be noted here is that, we will encrypt the password only when it is updated that is either "newly created" or "changed"*/
/* Important note - Arrow functions don't bind their own this value, so in this context, this does not refer to the document being processed.*/
user_schema.pre("save", async function (next) {
  if (!this.isModified("Password")) return next(); // this line means if the password is not modified we will return to the next() function direclty
  // other wise we will encrypt the password before saving it (encryption is also called hashing)\
  this.Password = await bcrypt.hash(
    this.Password,
    12
  ); /* hash is a function which we use to hash our password, the first argument is the field name 
  // whcih we want to hash/encrypt and the Second argument is the "cost"*/
  /* what this hash function will do is, first it will "Salt" the password and then hash it 
  "Salting"- it means adding some random string to the password, so that two same password does not generate
  the "same" hash (that is the same encryption) 
  "cost" - this parameter we specified is for salting the password only,technically it is a measure of how much
  CPU intensive this operation will be , higher the "cost" value means high CPU intensive operation and better
  the  password will be encrypted 
  Note-- if you want you can replace the "cost" with your "salt function" that is you can create a salt function
  by yourself and then use it in place of cost  */

  /* it should be noted that we are using the async version of hash() function and since it is an async version of hash
   therefore it will return a promise and we want to wait for that promise to be resolved, adn that's why
   we used the async - await */

  this.ConfirmPassword =
    undefined; /* THis  might be a little tricky but keeping it simple, we don't want 
  to hash the onfirmPassword, in the database we only want to store it as undefined
  NOw you might have a question that in the schema we have set it as a "required field" and also set a 
  validation  on it, so basically that will only check whether the "ConfirmPassword" is filled by the user 
  or not and whether it matched the "password field" when we receive some value for the confirm password,
  it is not concerned about what data we are storing in the database
  "In simple words - the required field will only check whether we have received the value for the confirm password
  or not , it is not going to check what values we are storing for this confirm password in the database"
  */
});

/* here we are going to create a function which will be responsible for comparing the password which we are
 recieving in the request body with the password saved in the database, we will be basically creating an 
 instance method. An "instance method" is basically available on all documents of a given collection
 in this case since we are creating it on User_model, this method will be available on all documents of "usercollections" */
// we have to use the "methods" property to achieve it,
// "comparePasswordInDb" is a custom method on method object
user_schema.methods.comparePasswordInDb = async function (
  pswdbyuser,
  pswdsavedindb
) {
  // here we will be returning a boolean value (true or false)
  //since the password in the database is encrypted so we willl be decrypting it while matching
  return await bcrypt.compare(String(pswdbyuser), pswdsavedindb);
};

// creating a userModel based on the above schema for performing certain operations

const UserModal = mongoose.model("usercollections", user_schema);

module.exports = UserModal;
