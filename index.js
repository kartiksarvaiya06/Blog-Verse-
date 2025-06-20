const express = require('express'); 
const path = require('path');
const mongoose = require("mongoose")
const cookieParser = require('cookie-parser');
const { checkForAuthenticationCookie } = require('./middleware/authentication');
const Blog = require('./models/Blog');

//connection of mongodb
mongoose
  .connect("mongodb://localhost:27017/BlogVerse")
  .then((e)=>console.log("mongodb is connected"))

const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');


const app = express();
const PORT = 8000 

//set view engine
app.set('view engine', 'ejs');
app.set("views",path.resolve("./views"));


//middleware
app.use(express.urlencoded({extended:false}))
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, "public")));


//middleware(check for authentication cookie)

app.use(checkForAuthenticationCookie("token"));


app.get("/",async (req,res)=>{
    const allBlogs = await Blog.find({});
    res.render("home",{
      user: req.user,
      blogs: allBlogs
    })
})


//register of routes folder
app.use('/user',userRoute)
app.use('/blog',blogRoute)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});