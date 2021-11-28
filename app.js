//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set("view engine", "ejs");
mongoose.connect("mongodb+srv://himanshuTomar:Himanshu%4012@cluster0.g9gkc.mongodb.net/todolistDB")


const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const itemOne = new Item({
  name: "Welcome to our todo's"
});

const itemTwo = new Item({
  name: "Hit + button to add a new item"
});

const itemThree = new Item({
  name: "<--Hit this to delete an item"
});

const defaultItem = [itemOne, itemTwo, itemThree];


const contentSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", contentSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if (foundItems.length === 0) {
      Item.insertMany(defaultItem, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully saved default itmes to database");
        }
      })
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        listItems: foundItems
      });
    }
    })
})


app.get("/:content", function(req, res){
  const contentName = _.capitalize(req.params.content);

  List.findOne({name: contentName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //create a new list
        const list = new List({
          name: contentName,
          items: defaultItem
        });
        list.save();
        res.redirect("/" + contentName);
      }else{
        //show an existing list
        res.render("list", {listTitle: foundList.name, listItems: foundList.items})
      }
    }
  })
});



app.post("/", function(req, res) {
  const itemName = req.body.itemValue;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    })
  }

});


app.post("/delete",function(req, res){
  const checkedId = req.body.checkbox;
  const listName = req.body.hiddenListName;

  if(listName === "Today"){
    Item.deleteOne({_id: checkedId}, function(err){
      if (!err){
        console.log("Successfully deleted item of id " + checkedId);
      }
    })
    res.redirect("/");
  }else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }

})





app.get("/about", function(req, res) {
  res.render("about")
})







app.listen(3000, function() {
  console.log("Server is running on port 3000");
});
