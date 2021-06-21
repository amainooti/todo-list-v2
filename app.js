//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-amaino:Test123@cluster0.s5nzo.mongodb.net/todolistDB', { useNewUrlParser: true, useUnifiedTopology: true });



const itemSchema = new mongoose.Schema({
    name: String
})

const Item = mongoose.model("Item", itemSchema)


const item1 = new Item({
    name: " Welcome to your todo"
})

const item2 = new Item({
    name: "Hit the + to add another item"
})

const item3 = new Item({
    name: " <----- Hit this to delete an item"
})



const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema)





app.get("/", function(req, res) {


    Item.find({}, function(err, foundItems) {

        if (foundItems.length === 0) {

            Item.insertMany(defaultItems, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("suceesfully found items");
                }
            });
            res.redirect("/");
        } else {

            res.render("list", { listTitle: "Today", newListItems: foundItems });
        }

    });



});

app.post("/", function(req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;


    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {

        item.save();
        res.redirect("/")
    } else {
        List.findOne({ name: listName }, (err, foundList) => {
            foundList.items.push(item);
            foundList.save()
            res.redirect("/" + listName)
        })
    }

});


app.post("/delete", (req, res) => {
    const checkItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkItemId, (err) => {
            if (!err) {
                console.log("Successfully removed items")
                res.redirect("/")
            }
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkItemId } } }, (err, foundList) => {
            if (!err) {
                res.redirect("/" + listName)
            }
        })
    }

})



app.get("/:customListName", function(req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                // creating an existing list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
                list.save()
                res.redirect("/" + customListName);
            } else {
                // show an existing list
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
            }
        }
    })

});

app.get("/about", function(req, res) {
    res.render("about");
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
});