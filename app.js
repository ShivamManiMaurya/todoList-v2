//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

// Make mongoose READY
mongoose.set("strictQuery", false);

main().catch(err => console.log("main error = "+err));

async function main() {
  await mongoose.connect("mongodb+srv://admin-shivam:Test123@cluster0.coa8htp.mongodb.net/todolistDB");
}

// Making mongoose schema
const itemSchema = new mongoose.Schema({
  name: String
});

// Making Model for the collection
const Item = mongoose.model("Item", itemSchema);

//  ************** Making the items ***************
const thar = new Item({
  name: "Mahindra Thar"
});

const swift = new Item({
  name: "Maruti Swift"
})

const safari = new Item({
  name: "Tata Safari"
})

// ****************** Inserting many items in the database *************
const itemsInCollection = [thar, swift, safari];


const listSchema = new mongoose.Schema({
  name: String,
  listItem: [itemSchema]
});

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  ShowList("Today", req, res);

});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const listName = req.body.list;

  const carModel = new Item ({
    name: item
  });

  if (listName === "Today"){
    //itemsInCollection.push(carModel);
    carModel.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.listItem.push(carModel);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

 
});

app.post("/delete", function(req, res){
  const checkboxItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkboxItemId, function(err){
      if (err){
        console.log(err);
      } else {
        console.log("Successfully deleted the item");
      }
    });
  
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {listItem: {_id: checkboxItemId}}}, function(err, foundList){
      res.redirect("/" + listName);
    });
  }

  
});

app.get("/:routeName", function(req, res){
  
  const routeNameVar = req.params.routeName;

  

  //if (routeNameVar !== "favicon.ico" || routeNameVar !== "Favicon.ico"){
    List.findOne({name: routeNameVar}, function(err, result){
      if (!err){
        if (!result){
          const list = new List({
            name: routeNameVar,
            listItem: itemsInCollection
          });
          list.save();

          res.redirect("/" + routeNameVar);
        }
        else {
          res.render("list", {listTitle: _.capitalize(result.name), newListItems: result.listItem})
        }
      }
    });
 // }
});

//app.get("/favicon.ico", (req, res) => res.status(204).end());

app.get("/about", function(req, res){
  res.render("about");
});


function ShowList(val, req, res) {
  Item.find({}, function(err, result){
    if (err){
      console.log("find method error = "+err);
    } else if (itemsInCollection.length === 0){
      Item.insertMany(itemsInCollection, function(err){
        if (err){
          console.log("insertMany error = "+err);
        }else {
          console.log("success!...All items are inserted");
        }
      })
      res.redirect("/");
    } else {
      res.render("list", {listTitle: val, newListItems: result});
    }
  });
}

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
