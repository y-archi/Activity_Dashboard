const express = require("express");
const app = express();
const router = express.Router();
const path = require("path")
const ejs = require("ejs")
const User = require("./mongodb")
const Task = require("./taskdb")
const templatePath = path.join(__dirname, '../templates')
const sessions = require("express-session")
const cookieParser = require("cookie-parser")
bodyparser = require("body-parser")
const mongoose = require("mongoose");

app.use(express.json())
app.use(bodyparser.urlencoded({ extended: true }));
app.set("view engine", "ejs")
app.set("views", templatePath)
app.use(express.urlencoded({ extended: false }))
app.use('/public', express.static('public'))
app.use('/public', express.static(path.join(__dirname, "../public")));
app.engine('ejs', require('ejs').renderFile);

//session middleware
app.use(sessions({
    secret: "thisisthesecretkey",
    saveUninitialized: true,
    cookie: { maxAge: 600000 },
    resave: false
}));
app.use(cookieParser());

var session;
app.get("/", async (req, res) => {
    console.log(" Request session ", req.session);

    let session = req.session;
    if (session.userid) {
        let users = await User.findOne({ name: session.userid }).populate('tasks');
        let tasks = await Task.find().populate('users');
        res.render("dashboard", { users: users, tasks: tasks })
    } else
        res.render("login")
})

app.post("/admin", async (req, res) => {
    const user = new User({
        name: req.body.name,
        password: req.body.password
    });
    await user.save();
    res.redirect("/admin");
})

app.post("/login", async (req, res) => {
    try {
        console.log(req.body.name, req.body.password)

        // if (req.body.name === "Admin" && req.body.password === "admin123") {
        //     session = req.session;
        //     session.userid = req.body.name;
        //     await console.log(req.session)
        //     res.redirect("/admin")
        // }
        let users = await User.findOne({ name: req.body.name });
        if (users.password === req.body.password) {
            session = req.session;
            session.userid = req.body.name;
            // console.log(req.session)
            res.redirect("/");
        }
        else {
            res.send("Wrong Password")
        }
    } catch (error) {
        res.send("Wrong Username and Password")
    }
})


app.post("/task", async (req, res) => {

    let name = req.body.user;
    let user = "";
    if (name)
        user = await User.findOne({ name: name });

    if (user) {
        const task = new Task({
            title: req.body.taskt,
            description: req.body.taskd,
            status: "Pending..",
            users: [user._id]
        });

        await task.save();
        //   console.log('Task : ',task ,' \n User : ', user)

        user.tasks.push(task._id);

        await user.save();
    }
    else {
        const task = new Task({
            title: req.body.taskt,
            description: req.body.taskd,
            status: "Pending..",
            users: []
        });
        task.save();
    }
    res.redirect("/admin");
})

app.post("/:id", async (req, res) => {
    let id = req.params.id;
    let users = await User.findOne({ _id: id }).populate('tasks');
    let tasks = await Task.find().populate('users');
    res.render("user", { users: users, tasks: tasks })
})

// app.post("/logout",(req,res)=>{
//     try {
//         req.session.destroy();
//         res.redirect("/");    
//     } catch (error) {
//         console.error({error})
//     }

// })

app.get("/logout", (req, res) => {
    try {
        req.session.destroy();
        res.redirect("/");
    } catch (error) {
        console.error({ error })
    }

})

app.get("/admin", async function (req, res) {

    let session = req.session;
    if (session.userid === "Admin") {


        let users = await User.find().populate('tasks');
        let tasks = await Task.find().populate('users');
        //  res.status(200).json(users)
        // console.log({users})
        res.render("admin", { name: "Admin", users: users, tasks: tasks })
    } else
        res.send("Unauthorized user");

})

app.get("/user/:_id", async (req, res) => {
    let id = req.params;
    await Task.deleteOne({ _id: id });
    res.redirect("/admin");
})


app.listen(3000, () => {
    console.log("Port connected : 3000 ");
    mongoose
        .connect("mongodb://127.0.0.1:27017/activity")
        .then(() => {
            console.log("MongoDB connected")
        })
        .catch((e) => {
            console.log("Failed to connect")
        })

})
