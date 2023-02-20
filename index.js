//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require ("lodash");

mongoose.set('strictQuery', false);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://kajunic77:blurn411@cluster0.dlepej5.mongodb.net/todolistDB", {useNewUrlParser: true});

 const itemsSchema = {
   name: String
 };

 const Item = mongoose.model("item", itemsSchema);

const work = new Item ({
  name: "Don't forget to go to Work!",
});
const essay = new Item ({
  name: "Write your Essay"
});
const groceries = new Item ({
  name: "Groceries"
});

const defaultItems = [work, essay, groceries];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// Item.insertMany(defaultItems, function(err){
//   if (err){
//     console.log(err);
//   } else {
//     console.log("Succesfully added.");
//   }
// });





app.get("/", function(req, res) {

  Item.find({}, function(err, results){
    if (results.length === 0){
      Item.insertMany(defaultItems, function(err){
        if (err){
          console.log(err);
        } else {
          console.log("Succesfully added!");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: results});
    }
  });

});

app.get("/:cutomListName", function (req, res){
  const customListName = _.capitalize(req.params.cutomListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        // Create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        //show an existing list
        res.render("list", {listTitle: foundList.name , newListItems: foundList.items})
      }
    }
  });


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today"){
      Item.findByIdAndRemove(checkedItemId, function(err){
        if (!err){
          console.log("Succesfully deleted checked item.");
          res.redirect("/");
        }
      });
    } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
        if(!err){
          res.redirect("/" + listName);
        }
      });
    }

  });




//     Item.findByIdAndRemove(checkedItemId, function(err){
//       if (err){
//         console.log(err);
//       } else {
//       console.log("Succesfully removed Item");
//       }
//     });
//     res.redirect("/");
// });

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
