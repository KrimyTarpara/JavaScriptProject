"use strict";

const express = require("express");
const hbs = require("hbs");
const sql = require("mysql");
const app = express();

const PORT = process.env.PORT || 3000;

const connection = sql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "assgn7",
});

connection.connect((err) => {
    if (err) {
        console.error("Error connecting to the database", err);
    } else {
        console.log("Connection successful");
    }
});

function renderArticleDetails(id, fileName, res) {
    const query = "SELECT * FROM `users` WHERE `articleID` = ?";
    connection.query(query, [id], (err, [article]) => {
        if (err) {
            res.render("database-error.hbs");
        } else {
            const articleDetails = {
                articleNo: article.articleID,
                articleName: article.articleName,
                articleContent: article.articleContent,
                articleDate: article.articleDate,
            };
            res.render(fileName, articleDetails);
        }
    });
}

app.set("port", PORT);

app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.render("hompage.hbs");
});

app.get("/articles", (req, res) => {
    const query = "SELECT `articleID` FROM `users`";
    connection.query(query, (err, results) => {
        if (err) {
            res.render("database-error.hbs");
        } else {
            res.render("articles.hbs", { results });
        }
    });
});

app.get("/add-article", (req, res) => {
    res.render("add-articles.hbs");
});

app.get("/articles/:articleNo", (req, res) => {
    renderArticleDetails(req.params.articleNo, "article.hbs", res);
});

app.get("/edit-articles/:articleNo", (req, res) => {
    renderArticleDetails(req.params.articleNo, "edit-articleID.hbs", res);
});

app.get("/delete-articles/:articleNo", (req, res) => {
    renderArticleDetails(req.params.articleNo, "delete-article.hbs", res);
});

app.post("/articles", (req, res) => {
    const currentDate = new Date();
    const query = "INSERT INTO `users` (`articleName`, `articleContent`, `articleDate`) VALUES (?, ?, ?)";
    
    connection.query(query, [req.body.articleName, req.body.articleContent, currentDate], (err, results) => {
        if (err) {
            res.render("database-error.hbs");
        } else {
            const getIdQuery = "SELECT MAX(`articleID`) AS 'articleID' FROM `articles`";
            connection.query(getIdQuery, (err, result) => {
                renderArticleDetails(result[0].articleID, "article.hbs", res);
            });
        }
    });
});

app.post("/article/edit", (req, res) => {
    const currentDate = new Date();
    const query = "UPDATE `users` SET `articleName`=?, `articleContent`=?, `articleDate`=? WHERE `articleID`=?";
    
    connection.query(query, [req.body.articleName, req.body.articleContent, currentDate, req.body.articleID], (err, results) => {
        if (err) {
            res.render("database-error.hbs");
        } else {
            renderArticleDetails(req.body.articleID, "edit-articleID.hbs", res);
        }
    });
});

app.post("/article/delete", (req, res) => {
    const query = "DELETE FROM `users` WHERE `articleID` = ?";
    
    connection.query(query, [req.body.articleID], (err, results) => {
        if (err) {
            res.render("database-error.hbs");
        } else {
            res.render("delete-article.hbs", { articleNo: req.body.articleID });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
