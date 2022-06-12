const express = require('express');
const app = express();
const cors =  require('cors');

const domains = ['http://localhost:8080'];

const corsOptions = {
  origin: function(origin, callback){
  	const isTrue = domains.indexOf(origin) !== -1;
    callback(null, isTrue);
  }
  ,
  credentials: true
}
app.use(cors(corsOptions));

app.use('/',express.static(__dirname));
app.use('/style', express.static(__dirname+"/style"));
app.use('/script', express.static(__dirname+"/script"));


app.listen(process.env.PORT || 8080, function(){
  console.log(`listening on ${process.env.PORT} or 8080`);
});

app.get('/',function(req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.sendFile(__dirname + '/index.html');
});
