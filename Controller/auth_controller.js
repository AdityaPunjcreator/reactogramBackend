const UserModal = require("../Modal/user_modal");
const PostModal = require("../Modal/post_modal");
const jwt = require("jsonwebtoken"); /* using this jason web token package we want to create a json web token
 which we want to send back to the client   */

/* since i have to send the token to the client/user and this function will be called at multiple occassin
 that's why creating it seperately and then using it wherever required -- */

const generateToken = (id) => {
  return jwt.sign({ id: id }, process.env.SECRET_STRING, {
    expiresIn: process.env.LOGIN_EXPIRES,
  });
};

const signUp = async (request, response) => {
  const { Fullname, Email, Password, PhoneNumber, ConfirmPassword } =
    request.body; // this will be provided by the user
  if (!Fullname || !Email || !PhoneNumber || !Password || !ConfirmPassword) {
    return response
      .status(400)
      .json({ error: "one or more requird credentials is not filled " });
  }
  // here Email is one of the field in our "UserCollections" collection, whcih we are matching
  const existinguser = await UserModal.findOne({
    Email: Email,
  });
  if (existinguser) {
    return response
      .status(400)
      .json({ error: "user already exists! please login" });
  }

  try {
    const newUser = await UserModal.create(request.body);
    /* header we don't need to create it will automatically be created by sign function. the first argument
     of the "sign" includes the payload(which is gonna be the object) and the second argument is the secret string
    It depends on you which "property" you want to include in the payload moreover it should be noted that
    the more the property is there in the payload, the better and the secure the token will be created */

    /* "Persisting" the secret string refers to the act of storing the secret string in a way that 
    it is retained or saved for future use, typically beyond the lifespan of the current application or session. 
    The goal is to ensure that the secret is available for use even if the application is restarted, the server is rebooted, or the session ends.*/
    //so in the second argument, we also need to persist the secret string
    //VVI-  According to the standards of "sha256" encryption for the signature the secret string should be
    // atleast of 32 characters long
    /*we can also specify some third Optional argument which is going to be an object and in there we can
    specify some options, the option which i a, going to specify here is when should this JWT which we are
    creating here that should expire  */
    /*const token = jwt.sign({ id: newUser._id }, process.env.SECRET_STRING, {
      expiresIn:
        process.env
          .LOGIN_EXPIRES /*once the Login expires,(once the JWT expires this means that) 
      the user can no longer  login to the application with that same JWT, so he has to login again and new JWT will be crated again
     -- just to  inform these extra options are alos added to the payload part only , but rest assured the JWT
     token will not be generated based on the extra payload,
    });*/

    const token = generateToken(newUser._id);
    /* To login a user means to sign a JWT and send it back to the client, Note- we will only issue a token
    if the user exists in the database and the password provided by that user is correct */
    response.status(201).json({
      data: newUser,
      message: "user created successfully",
    });
  } catch (err) {
    response.status(400).json({ error: err.message });
  }
};

const login = async (request, response) => {
  try {
    const { Email, Password } = request.body;
    // here we are checking whether the user has entered the Email or Password or not
    if (!Email || !Password) {
      return response
        .status(400)
        .json({ error: "please enter one or more credentials" });
    }

    // now here we are going to check whether a user with that credentials exists in the database or not

    // const user = await UserModal.findOne({ Email: Email }) , note the output  of this is not going to have a password field bcz in the "modal" we have select it to "false"
    // that is why in the below code we are explicitly selecting the "password" field using "+ symbol", which is required, when we have to select those fields which is not by default selected
    const user = await UserModal.findOne({ Email: Email }).select("+Password"); // here we are providing "Email"  field name by which we want to filter the user, the Email in the value is the one coming from the user
    /* now once we have got the user, based on the email, we want to compare the "password" provided by the 
     the user to the one present in our database */
    //note - user here is the instance of the user model
    // also matching the password
    /* the below try catch block is actually used to handle the error whcih is encountered while matching thepassword
    if you want you can remove this try catch block */
    try {
      // check if the user exists and password matches
      if (!user || !(await user.comparePasswordInDb(Password, user.Password))) {
        return response.status(400).json({ error: "invalid credentials" });
      }
      // const isMatch = await user.comparePasswordInDb(Password, user.Password);
      // if (!isMatch) {
      //   response.status(400).json({ message: "invalid credentials" });
      // }
      // if everything is okay, we are sending a JWT to the client
      const token = generateToken(user._id);

      return response
        .status(200)
        .json({ message: "logged in successfully", token, user }); // here i have added "user" field, it is for testing purpose
    } catch (error) {
      return response
        .status(500)
        .json({ message: "Error comparing passwords" });
    }
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
  // VVI- I've added return statements after sending responses to ensure that the function exits after sending a response. I've added return statements after sending responses to ensure that the function exits after sending a response.
};
// getting a user detail
// const getUserProfile = async (request, response) => {
//   try {
//     const userId = request.params.userId;
//     const user = await UserModal.findById(userId)
//     if (!user) {
//       return response.status(404).json({ error: "User not found" });
//     }

//     // Send relevant user information to the client
//     response.status(200).json({ message: "data fetched succesfully", user });
//   } catch (error) {
//     response.status(500).json({ error: error.message });
//   }
// };
// in order to protect routes we are going to crate this middleware function which is going to run before the handler
const protect = async (request, response, next) => {
  try {
    //1)read the token and check if it exists or not
    /* The point is how are we going to send the token with the request, the common practice to send the token
     with the request is by using the HTTP headers with the request, so on the request header we are going to
      set a custom header called "authorization"- which is a standard name, when we want to send jwt with request*/
    const { authorization } = request.headers;
    if (!authorization) {
      return response.status(400).json({ error: "user not logged in" });
    }
    // if the authorization exists then we will be retrieving the token from it
    const token = authorization.split(" ")[1];
    //2)now we are validating the token

    jwt.verify(
      token,
      process.env.SECRET_STRING,
      async (error, decodedToken) => {
        if (error) {
          return response.status(400).json({ error: "invalid token" });
        }
        const { id } = decodedToken;
        //3) now we are checking  if the user exist in our database or not
        const user = await UserModal.findById(id);
        if (user) {
          request.user = user;
          //5) allow user to access route
          next(); // after that it will go to the next middleware
        } else {
          return response.status(400).json({ error: "Invalid user" });
        }
      }
    );

    //4) if the user changed password after the token was issued ( we will see this later on with this code)
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};

module.exports = { signUp, login, protect };
