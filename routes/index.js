var express = require("express");
var router = express.Router();
var formidable = require("formidable");
var fs = require("fs");
//var cors = require("cors");
const app = express();
const showdown = require("showdown");
const converter = new showdown.Converter();
const http = require("http");
const server = http.Server(router);
const io = require("socket.io")(server);
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
var MongoClient = require("mongodb").MongoClient;
//var url = "mongodb+srv://admin:55555@mirror.k24kx.gcp.mongodb.net/pic_mirror?retryWrites=true&w=majority"; //ก้อบมาทำไมจำไม่ได้เก้บไว้ก่อน
var url = "mongodb+srv://admin:55555@mirror.k24kx.gcp.mongodb.net/test"; //อันนี้ใช้ได้สมัครแล้วเมลดิชั้น โหลด mongodbcompassมาจะง่ายขึ้นมั้ง คล้ายที่อัพลงกะเครื่องแต่ใส่ลิ้งจะเชื่อมอันจริงได้
router.get("/", function (req, res, next) {
  res.render("home");
});
router.get("/cam", function (req, res, next) {
  res.render("cam");
});
router.get("/thanks", function (req, res, next) {
  //mobile
  res.render("thanksmobile");
});
router.get("/prev", function (req, res, next) {
  //mobile
  res.render("prev");
});
router.get("/step1", function (req, res, next) {
  //mobile
  res.render("step1");
});
router.get("/step2", function (req, res, next) {
  //mobile
  res.render("step2");
});
router.get("/photo_ori", function (req, res, next) {
  //ดึงรูปออริ หน้า pic ในเอ้กดี ที่เป็นรูปตอนถ่ายเสดแล้วให้ดูว่าจะเอารูปนี้มั้ย
  var mysort = { _id: -1 };
  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("pic_mirror");
    dbo
      .collection("picture")
      .find()
      .sort(mysort)
      .limit(1)
      .toArray(function (err, result) {
        if (err) throw err;
        console.log(result);
        db.close();
        res.render("photo_ori", { picdata: result });
      });
  });
});
router.get("/frame", function (req, res, next) {
  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    //*****แก้หน้าที่ดึงออกมาให้เป็นหมวด */
    if (err) throw err;
    var dbo = db.db("pic_mirror"); //แก้ให้ดึงจากลิ้งจริงแล้ว อันเก่าคือ mydb
    dbo
      .collection("frame")
      .find({}, { projection: { _id: 0, name: 1 } })
      .toArray(function (err, result) {
        if (err) throw err;
        console.log("1" + result);
        var mysort = { _id: -1 }; //new to old
        dbo
          .collection("picture")
          .find()
          .sort(mysort)
          .limit(1)
          .toArray(function (err, result3) {
            if (err) throw err;
            console.log(result3);
            res.render("frame", { frame: result, picdata: result3 });
            db.close();
          });
      });
  });
});

router.get("/ads", function (req, res, next) {
  res.render("ads");
});

router.get("/uploadpng", function (req, res, next) {
  res.render("upload_png"); //form อัพสตก.
});

router.get("/uploadframe", function (req, res, next) {
  res.render("upload_frame"); //form อัพกรอบรูป
});

router.get("/index", function (req, res, next) {
  res.render("index");
});

router.get("/edit", function (req, res, next) {
  var mysort = { _id: -1 };
  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("pic_mirror");
    dbo
      .collection("picture")
      .find()
      .sort(mysort)
      .limit(1)
      .toArray(function (err, result) {
        if (err) throw err;
        console.log(result);
        db.close();
        res.render("edit", { picdata: result });
      });
  });
});
router.get("/camwait", function (req, res, next) {
  res.render("camwait");
});

router.post("/fileuploadpng", function (req, res, next) {

  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var oldpath = files.filetoupload.path;
    var type = fields.types;
    var newpath =
      "https://test-so-complicated.herokuapp.com/PNG/" +
      files.filetoupload.name; //อัพลงโฟล์เดอร์ใหม่จำลองจากเครื่องตัวเอง  *******เปลี่ยนตรงนิ
    var path =
      "https://test-so-complicated.herokuapp.com/PNG/" +
      files.filetoupload.name; //ตัวแปรที่จะอัพลงmongo  
    /*  var newpath =
      "C:/Users/Acer/Desktop/pjfinal/phone+mirr/phone/app/public/PNG/" +
      files.filetoupload.name; //อัพลงโฟล์เดอร์ใหม่จำลองจากเครื่องตัวเอง  *******เปลี่ยนตรงนิ
    var path =
      "https://test-so-complicated.herokuapp.com/PNG/" +
      files.filetoupload.name; //ตัวแปรที่จะอัพลงmongo*/
    var name = files.filetoupload.name; //เก้บชื่อ
    fs.rename(oldpath, newpath, function (err) {
      if (err) throw err;
      else {
        MongoClient.connect(url, function (err, db) {
          if (err) throw err;
          var dbo = db.db("pic_mirror"); //ชื่อดาต้าเบส
          var myobj = { name: name, path: path, types: type }; //อัพชื่อกับพาท
          dbo.collection("png").insertOne(myobj, function (err, res) {
            //ชื่อcollection
            if (err) throw err;
            else {
              console.log("1 sticker inserted");
            }
            db.close();
          });
        });
      }
      res.render("upload_png"); //อัพแล้วรีไปหน้าอัพใหม่
    });
  });
});

router.post("/fileuploadframe", function (req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var oldpath = files.filetoupload.path;
    var type = fields.types;
    //console.log(type);
    //var newpath = "https://test-so-complicated.herokuapp.com/PNG/" + files.filetoupload.name; //อัพลงโฟล์เดอร์ใหม่ตอนที่เอาลงเซิฟเวอร์จริง
   var newpath =
      "https://test-so-complicated.herokuapp.com/frame/" +
      files.filetoupload.name; //อัพลงโฟล์เดอร์ใหม่จำลองจากเครื่องตัวเอง ****เปลี่ยนตรงนี้ๆๆๆแค่นั้น
    var path =
      "https://test-so-complicated.herokuapp.com/frame/" +
      files.filetoupload.name; //ตัวแปรที่จะอัพลงmongo
   /*   var newpath =
      "C:/Users/Acer/Desktop/pjfinal/phone+mirr/phone/app/public/frame/" +
      files.filetoupload.name; //อัพลงโฟล์เดอร์ใหม่จำลองจากเครื่องตัวเอง ****เปลี่ยนตรงนี้ๆๆๆแค่นั้น
    var path =
      "https://test-so-complicated.herokuapp.com/frame/" +
      files.filetoupload.name; //ตัวแปรที่จะอัพลงmongo*/
    var name = files.filetoupload.name; //เก้บชื่อ
    fs.rename(oldpath, newpath, function (err) {
      if (err) throw err;
      else {
        MongoClient.connect(url, function (err, db) {
          if (err) throw err;
          var dbo = db.db("pic_mirror"); //ชื่อดาต้าเบส
          var myobj = { name: name, path: path, types: type }; //อัพชื่อกับพาท
          dbo.collection("frame").insertOne(myobj, function (err, res) {
            //ชื่อcollection
            if (err) throw err;
            else {
              console.log("1 document inserted");
              //alert("กรอบเกลียวเคี้ยวโป้เต้");
            }
            db.close();
          });
        });
      }
      res.render("upload_frame"); //อัพแล้วรีไปหน้าอัพใหม่
    });
  });
});

router.post("/api", function (req, res, next) {
  ///เอารูปที่ถ่ายเข้าดาต้าเบส
  const data = req.body; //รับมาจากหน้าcam
  console.log(data);
  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("pic_mirror"); //ชื่อดาต้าเบส
    //var myobj = { data }; //อัพpic
    dbo.collection("picture").insertOne(data, function (err, res) {
      //ชื่อcollection
      if (err) throw err;
      else {
        console.log("1 document inserted");
        //alert("wait a minute รอหน่อยๆๆๆๆ");
      }
      db.close();
    });
  });
  res.json(data);
});

router.post("/deco", urlencodedParser, function (req, res, next) {
  ///เอารูปที่ใส่กรอบแล้วเข้าดาต้าเบส picframe
  const data = req.body; //รับมาจากหน้าframe
  console.log(data);
  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("pic_mirror"); //ชื่อดาต้าเบส
    //var myobj = { data }; //อัพpic
    dbo.collection("picframe").insertOne(data, function (err, res) {
      //ชื่อcollection
      if (err) throw err;
      else {
        console.log("1 document inserted");
      }
      db.close();
    });
  });
  res.json(data);
});

router.get("/dec", function (req, res, next) {
  //ดึงรูปมาแสดงในหน้าใส่ติ้กเก้อ
  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("pic_mirror"); //แก้ให้ดึงจากลิ้งจริงแล้ว อันเก่าคือ mydb
    dbo
      .collection("png")
      .find({}, { projection: { _id: 0, name: 1 , types: 1 } })
      .toArray(function (err, result) {
        if (err) throw err;
        console.log("1" + result);
        var mysort = { _id: -1 }; //new to old
        dbo
          .collection("picframe")
          .find()
          .sort(mysort)
          .limit(1)
          .toArray(function (err, result3) {
            if (err) throw err;
            console.log(result3);
            res.render("dec", { png: result, picdata: result3 });
            db.close();
          });
      });
  });
});

router.get("/cc", function (req, res, next) {
  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("pic_mirror");
    var query = { test: "check" };
    dbo
      .collection("check")
      .find(query)
      .toArray(function (err, result) {
        if (err) throw err;
        else {
          console.log(result[0].Value);

          if (result[0].Value == 3) {
            //ดึงรูปที่ถ่าย
            res.redirect("/photo_ori");
          }

          if (result[0].Value == 2) {
            //กระจก
            res.redirect("/camwait");
          }
          if (result[0].Value == 9) {
            //กระจก
            res.redirect("/camwait");
          } else {
            res.render("index", { title: "Express" });
          }
          db.close();
        }
      });
  });
});

router.post("/print", urlencodedParser, function (req, res, next) {
  ///เอารูปที่ใส่ติ้กแล้วเข้าดาต้าเบส picprint
  const data = req.body; //รับมาจากหน้าframe
  const x = 5;
  console.log(data);
  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("pic_mirror"); //ชื่อดาต้าเบส
    //var myobj = { data }; //อัพpic
    dbo.collection("picprint").insertOne(data, function (err, res) {
      //ชื่อcollection
      if (err) throw err;
      else {
        console.log("1 document inserted");
        var myquery = { test: "check" };
        var newvalue = { $set: { Value: x } };
        dbo
          .collection("check")
          .updateOne(myquery, newvalue, function (err, res) {
            //ชื่อcollection
            if (err) throw err;
            else {
              console.log("1 document update");
            }
            db.close();
          });
      }
    });
  });
  res.json(data);
});

router.post("/print1", urlencodedParser, function (req, res, next) {
  ///เอารูปที่ใส่ติ้กแล้วเข้าดาต้าเบส picprint
  const data = req.body; //รับมาจากหน้าframe
  const x = 10;
  console.log(data);
  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("pic_mirror"); //ชื่อดาต้าเบส
    //var myobj = { data }; //อัพpic
    dbo.collection("picprint").insertOne(data, function (err, res) {
      //ชื่อcollection
      if (err) throw err;
      else {
        console.log("1 document inserted");
        var myquery = { test: "check" };
        var newvalue = { $set: { Value: x } };
        dbo
          .collection("check")
          .updateOne(myquery, newvalue, function (err, res) {
            //ชื่อcollection
            if (err) throw err;
            else {
              console.log("1 document update");
            }
            db.close();
          });
      }
    });
  });
  res.json(data);
});

router.post("/frame1", urlencodedParser, function (req, res, next) {
  ///เอารูปที่ใส่ติ้กแล้วเข้าดาต้าเบส picprint
  const data = req.body; //รับมาจากหน้าออริ
  const x = 4;
  console.log(data);
  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("pic_mirror"); //ชื่อดาต้าเบส
    //var myobj = { data }; //อัพpic
    dbo.collection("picframe").insertOne(data, function (err, res) {
      //ชื่อcollection
      if (err) throw err;
      else {
        console.log("1 document inserted");
        var myquery = { test: "check" };
        var newvalue = { $set: { Value: x } };
        dbo
          .collection("check")
          .updateOne(myquery, newvalue, function (err, res) {
            //ชื่อcollection
            if (err) throw err;
            else {
              console.log("1 document update");
            }
            db.close();
          });
      }
    });
  });
  res.json(data);
});

router.get("/preview", function (req, res, next) {
  //ดึงรูปมาแสดงในหน้าพรีวิว
  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("pic_mirror"); //แก้ให้ดึงจากลิ้งจริงแล้ว อันเก่าคือ mydb
    var mysort = { _id: -1 }; //new to old
    dbo
      .collection("picprint")
      .find()
      .sort(mysort)
      .limit(1)
      .toArray(function (err, result3) {
        if (err) throw err;
        console.log(result3);
        res.render("preview", { picdata: result3 });
        db.close();
      });
  });
});

router.post("/upcheck", function (req, res, next) {
  ///เอารูปที่ถ่ายเข้าดาต้าเบส
  const data = req.body.x; //รับมาจากหน้าcam
  console.log(data);
  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("pic_mirror"); //ชื่อดาต้าเบส
    var myquery = { test: "check" };
    var newvalue = { $set: { Value: data } };
    dbo.collection("check").updateOne(myquery, newvalue, function (err, res) {
      //ชื่อcollection
      if (err) throw err;
      else {
        console.log("1 document update");
      }
      db.close();
    });
  });
  res.json(data);
});

module.exports = function (io) {
  //Socket.IO
  io.on("connection", (socket) => {
    console.log(`[ index.js ] ${socket.id} connected`);
    socket.on("disconnect", () => {
      console.log(`[ index.js ] ${socket.id} disconnected`);
    });
  });
  function updateSlide(data) {
    io.emit("update slide",  data );
  }
  router.post("/api/updateSlide", (req, res) => {
    console.log(
      `[ server.js ] GET request to 'api/updateSlide' => ${JSON.stringify(
        req.query
      )}`
    );
    const data = req.body.dataURL; //รับมาจากหน้าที่ส้ง
    console.log(data);
    if (data) {
      updateSlide(data);
      res.json("ok");
    } else {
      res.status(400).send('Invalid parameters.\n');
    }
  });
  return router;
};
//module.exports = router;
