var express = require("express");
var router = express.Router();
const userModel = require("./users");
const passport = require("passport");
const localStrategy = require("passport-local");
const exceljs = require("exceljs");
const flash = require("connect-flash");

passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/register", isAdmin, function (req, res, next) {
  res.render("register");
});

router.get("/profile", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  // console.log(user);
  res.render("profile", { user });
});

router.get("/changepassword", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  // console.log(user);
  res.render("changepassword", { user });
});

router.get("/resetpassword", isAdmin, function (req, res) {
  res.render("resetpassword");
});

router.get("/submitdate", isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("submitdate", { user });
  console.log("get/submitdate done ============");
});

// router.get('/admin', isAdmin, async function(req, res, next){
//   const user = await userModel.findOne({ username: req.user.username });
//   console.log(user);
//   res.render("admin");
// });
router.get("/admin", isAdmin, async function (req, res) {
  userModel
    .find({}) //role: { $ne: "Admin" }
    .then((users) => {
      //console.log(users);
      res.render("admin", { users });
    })
    .catch((err) => {
      console.error(err);
    });
});

router.get("/admin/search", isAdmin, async (req, res) => {
  const username = req.query.username;

  try {
    const user = await userModel.findOne({ username: username });

    if (!user) {
      return res.send("No user found with that username");
    }

    // If a user is found, send their details
    //res.json(userfound.fullName);                // .dev
    res.render("search", { user: user });
  } catch (err) {
    console.error(err);
    return res.send("An error occurred");
  }
});

router.post("/resetpassword", async (req, res) => {
  const username = req.body.username;
  const newpassword = req.body.password;
  const password2 = req.body.password2;
  if (!username || !newpassword || !password2) {
    return res.send("Enter username/email and both password fields");
    return res.redirect("/resetpassword");
  }
  if (newpassword.length < 6) {
    return res.send("Password should be at least 6 Characters long.");
    return res.redirect("/resetpassword");
  }
  if (newpassword !== password2) {
    return res.send("Passwords do not match");
    return res.redirect("/resetpassword");
  } else {
    try {
      const user = await userModel.findOne({ username: username });
      if (!user) {
        return res.send("user not found");
      } else {
        //userfound so call setPassword() and save new password after validation
        console.log("user exist and  new passwords taken so far.");
        console.log(user);
        user.setPassword(newpassword, async function (error, user) {
          if (error) {
            res.send("an error occured during setPassword"); // to Flash   .dev
            res.render("/resetpassword");
          }
        });
        await user.save();
        console.log("password change saved.");
        req.flash("success_msg", "Password changed successfully"); //show it as Flash  .dev
        // res.send('<script>alert("Password changed successfully"); window.location.href = "/admin";</script>')
        res.redirect("/admin");
      }
    } catch (err) {
      console.error(err);
      return req.flash(
        "error",
        "You need to be logged in as an admin for this action."
      );
      return res.redirect("/resetpassword");
    }
  }
});

router.post("/changepassword", async (req, res) => {
  const username = req.body.username;
  const newpassword = req.body.password;
  const password2 = req.body.password2;
  if (!username || !newpassword || !password2) {
    return res.send("Enter both password fields");
    return res.redirect("/resetpassword");
  }
  if (newpassword.length < 6) {
    return res.send("Password should be at least 6 Characters long.");
    return res.redirect("/resetpassword");
  }
  if (newpassword !== password2) {
    return res.send("Passwords do not match");
    return res.redirect("/resetpassword");
  } else {
    try {
      const user = await userModel.findOne({ username: username });
      if (!user) {
        return res.send("user not found");
      } else {
        //userfound so call setPassword() and save new password after validation
        console.log("user exist and  new passwords taken so far.");
        console.log(user);
        user.setPassword(newpassword, async function (error, user) {
          if (error) {
            res.send("an error occured during setPassword"); // to Flash   .dev
            res.render("/resetpassword");
          }
        });
        await user.save();
        console.log("password change saved.");
        req.flash('success_msg: "Password changed successfully"'); //show it as Flash  .dev
        res.send(
          '<script>alert("Password changed successfully"); window.location.href = "/profile";</script>'
        );
        res.redirect("/profile");
      }
    } catch (err) {
      console.error(err);
      return req.flash(
        "error",
        "You need to be logged in as an admin for this action."
      );
      return res.redirect("/resetpassword");
    }
  }
});

//submit register request to create user
// router.post("/register", function (req, res, next) {
//   const data = new userModel({
//     fullName: req.body.fullName,
//     contact: req.body.contact, // getting data from input tags in register page to save in db schema, input tag name must match req.body.{tag_naam}
//     username: req.body.username,
//     industry: req.body.industry,
//     location: req.body.city,
//     role: req.body.role,
//     password: req.body.password
//   });

//   userModel.register(data, req.body.password).then(function () {
//     passport.authenticate("local")(req, res, function () {
//       res.redirect("/profile");
//     });
//   });
// });

router.post("/register", (req, res) => {
  const {
    fullName,
    contact,
    username,
    industry,
    city,
    role,
    empCode,
    password,
  } = req.body;
  let errors = [];
  //check required fields
  if (
    !fullName ||
    !contact ||
    !username ||
    !industry ||
    !city ||
    !role ||
    !empCode ||
    !password
  ) {
    errors.push({ msg: "Please fill in all fields." });
  }
  //check pwd length
  if (password.length < 6) {
    errors.push({ msg: "password should be at least 6 character long." });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      fullName,
      contact,
      username,
      industry,
      city,
      role,
      empCode,
      password,
    });
  } else {
    userModel.findOne({ username: username }).then((user) => {
      if (user) {
        // user already exist
        errors.push({
          msg: "Email already registered, please login or check Email",
        });
        res.render("register", {
          errors,
          fullName,
          contact,
          username,
          industry,
          city,
          role,
          empCode,
          password,
        });
      } else {
        const data = new userModel({
          fullName: req.body.fullName,
          contact: req.body.contact, // getting data from input tags in register page to save in db schema, input tag name must match req.body.{tag_naam}
          username: req.body.username,
          industry: req.body.industry,
          location: req.body.city,
          role: req.body.role,
          empCode: req.body.empCode,
        });

        userModel.register(data, req.body.password).then(function () {
          passport.authenticate("local")(req, res, function () {
            res.redirect("/admin");
          });
        });
      }
    });
  }
});

router.post("/profile", isLoggedIn, async (req, res) => {
  let dateStrings = req.body.selectedDates.split(","); // Split the input field on commas
  let dates = dateStrings.map((dateStr) => {
    let date = new Date(dateStr.trim());
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  });

  try {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    console.log(user);
    // Find the user by username
    //const user = await User.findOne({ username });

    if (!user) {
      return res.send("user not found"); // status(404).json({ message: 'User not found' });
    }

    // Add the dates to the user's "dates" array
    user.dates = dates;

    // Save the updated user
    await user.save();

    return res.render("submitdate", { user });

    //return res.status(200).json({ message: "Dates saved successfully" });
  } catch (error) {
    console.error("Error saving dates:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err); // will generate a 500 error
    }
    // Generate a JSON response reflecting authentication status
    if (!user) {
      return res.send(
        '<script>alert("Incorrect username or password.");window.location.href = "/";</script>'
      );
      // req.flash({"error_msg": "authentication failed: Incorrect email or password."});
      // return res.send(401,{ success : false, message : 'authentication failed: Incorrect email or password.' });   //.dev
    }
    req.login(user, function (err) {
      if (err) {
        return next(err);
      } else if (user.role == "Admin") {
        return res.redirect("/admin");
      }
      return res.redirect("/profile");
      // return res.send({ success : true, message : 'authentication succeeded' });     .dev
    });
  })(req, res, next);
});

router.get("/exportuserdata", async function (req, res) {
  try {
    const Workbook = new exceljs.Workbook();
    const worksheet = Workbook.addWorksheet("usersdata");
    worksheet.columns = [
      { header: "S/N", key: "s_no" },
      { header: "Employee Code", key: "empCode" },
      { header: "Email", key: "username" },
      { header: "Name", key: "fullName" },
      { header: "Contact", key: "contact" },
      { header: "Industry", key: "industry" },
      { header: "available Dates", key: "dates" },
    ];
    let counter = 1;
    const userdata = await userModel.find({});
    userdata.forEach((user) => {
      user.s_no = counter;
      worksheet.addRow(user);
      counter++;
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    res.setHeader(
      "Content-Type",
      "application/vndopenxmlformats-officedocument.spreadsheatml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=usersdata.xlsx`);
    return Workbook.xlsx.write(res).then(() => {
      res.status(200);
    });
  } catch (error) {
    console.log(error.message);
  }
});

router.get("/logout", function (req, res, next) {
  req.logOut(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error", "You need to be logged in for this action.");
    res.redirect("/");
  }
}

async function isAdmin(req, res, next) {
  try {
    if (req.isAuthenticated()) {
      if (req.user.role == "Admin") {
        return next();
      } else {
        return res.redirect("/profile");
      }
    } else {
      return res.redirect("/");
    }
  } catch (error) {
    // Handle any errors (e.g., database connection issues)
    console.error("Error in isAdmin middleware:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = router;
