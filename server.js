/**
 * @author dbm
 */
var http = require("http");
var url = require("url");
var fs = require('fs');
//var sys = require('sys')
var sys = require('util')
var spawn = require('child_process').spawn;

function main(){
    config = fs.readFileSync("config.json", "ascii");
    config = JSON.parse(config);
    console.log("DEBUG Gdb.Person:", Gdb.Person.collectionName);
    console.log("DEBUG Gdb.Place:", Gdb.Place.collectionName);

    server = http.createServer(function(request, response){
        var purl = url.parse(request.url, true);
        
        try {
            var resp = JSON.stringify({error:"unknown args in " + request.url});
            // ok, look at query string
            var resp = JSON.stringify({
                error: "unknown args in " + request.url
            });
            var qargs = purl.query;
            console.log("qargs:", qargs);
            
            // action=query
            if ("action" in qargs && qargs.action == "query") {
                resp = "that was fun!"
            }
            // default response is resp as text/plain
            response.writeHead(200, {
                "Content-Type": "text/plain"
            });
            response.write(resp);
            response.end();
        } 
        catch (err) {
            console.log("ERROR in createServer:", err);
            response.write("" + err);
            response.end();
        }
    });
    server.listen(config.port);
}

Gdb = {}
function openDb(dbname, cols, cb){
    var Db = require('mongodb').Db
    var Connection = require('mongodb').Connection
    var Server = require('mongodb').Server;
    
    var host = 'localhost';
    var port = Connection.DEFAULT_PORT;

    var db = new Db(dbname, new Server(host, port, {}));
    db.open(function(err, db){
        if (cols.length > 1) {
            db.collection(cols[0], function(err, col){
                Gdb[cols[0]] = col;
                openDb(dbname, cols.slice(1), cb)
            });
        }
        else {
            db.collection(cols[0], function(err, col){
                Gdb[cols[0]] = col;
                cb()
            });
        }
    });
}

openDb("mrofl", ["Person", "Place"], main);
