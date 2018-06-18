var http = require("http"),
    fs = require("fs"),
    url = require("url");
//创建服务监听窗口
var server = http.createServer(function (req, res) {
    var urlObj = url.parse(req.url, true),
        pathname = urlObj.pathname,
        query = urlObj.query;
    //静态文件资源请求
    var reg = /\.(HTML|CSS|JS|ICO)/i;
    if (reg.test(pathname)) {
        var suffix = reg.exec(pathname)[1].toUpperCase();
        var conType = suffix === "HTML" ? "text/html" : (suffix === "CSS" ? "text/css" : "text/javascript");
        try {
            var conFile = fs.readFileSync('.' + pathname, 'utf-8');
            res.writeHead(200, {'content-type': conType + ';charset=UTF-8;'});
            res.end(conFile);
        } catch (e) {
            res.writeHead(404);
            res.end("请求文件错误");
        }
        return;
    }
    var con = null,
        result = null,
        customerId = null,
        customerPath = "./json/customer.json";
    con = fs.readFileSync(customerPath, "utf-8");
    con.length === 0 ? con = "[]" : null;
    con = JSON.parse(con);
    //1、获取所有的客户信息

    if (pathname === '/getData') {
        result = {
            code: 1,
            msg: "没有任何客户信息",
            data: null
        };
        if (con.length > 0) {
            result = {
                code: 0,
                msg: "获取成功",
                data: con
            };
        }
        res.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
        res.end(JSON.stringify(result));
        return;

    }
    //2、获取具体的某一个客户的信息
    if (pathname === "/getInfo") {
        //获取客户端传递给服务器端的客户ID值
        console.log(query)
        customerId = query["id"];
        result = {
            code: 1,
            msg: "客户不存在",
            data: null
        };
        for (var i = 0; i < con.length; i++) {
            if (con[i]["id"] == customerId) {
                result = {
                    code: 0,
                    msg: "获取成功",
                    data: con[i]
                };
                break;
            }
        }
        res.writeHead(200, {'content-type': 'application/json;charset=utf-8;'});
        res.end(JSON.stringify(result));
        return;
    }
    //3、根据传进来的ID删除信息
    if (pathname === "/deleteInfo") {
        customerId = query["id"];
        result = {
            code: 1,
            msg: "删除失败"
        };
        var flag = false;
        for (var i = 0; i < con.length; i++) {
            if (con[i]["id"] == customerId) {
                con.splice(i, 1);
                flag = true;
                break;
            }
        }
        if (flag) {
            fs.writeFileSync(customerPath, JSON.stringify(con), 'utf-8');
            result = {
                code: 0,
                msg: "删除成功"
            };
        }
        res.writeHead(200, {'content-type': 'application/json;charset=utf-8'});
        res.end(JSON.stringify(result));
        return;
    }
    //4、增加客户信息
    if (pathname === "/addInfo") {
        var str = '';
        req.on("data", function (chunk) {
            str += chunk;
        });

        req.on("end", function () {
            if (str.length === 0) {
                res.writeHead(200, {'content-type': 'application/json;charset=utf-8'});
                res.end(JSON.stringify({
                    code: 1,
                    msg: "增加失败，没有传递任何职进来"
                }));
                return;
            }
            var data = JSON.parse(str);
            data["id"] = con["id"] === 0 ? 1 : parseInt(con[con.length - 1]["id"]) + 1;
            con.push(data);
            fs.writeFileSync(customerPath, JSON.stringify(con), 'utf-8');
            res.writeHead(200, {'content-type': 'application/json;charset=utf-8'});
            res.end(JSON.stringify({
                code: 0,
                msg: "增加成功"
            }));

        });
        return;
    }
    //5、根据传递进来的客户ID修改该客户
    if (pathname === "updateInfo") {
        str = '';
        req.on("end", function (chunk) {
            str += chunk;
        });
        req.on("end", function () {
            result = {
                code: 1,
                msg: "修改失败,没有传递任何职进来"
            };
            if (str.length === 0) {
                res.writeHead(200, {'content-type': 'application/json;charset=utf-8'});
                res.end(JSON.stringify(result));
                return;
            }

            var flag = false,
                data = JSON.parse(str);
            for (i = 0; i < con.length; i++) {
                if (con[i]["id"] == data["id"]) {
                    con[i] = data;
                    flag = true;
                    break;
                }
            }
            result = {
                code: 1,
                msg: "修改失败"
            };
            if (flag) {
                fs.writeFileSync(customerPath, JSON.stringify(con), 'utf-8');
                result = {
                    code: 0,
                    msg: "增加成功"
                }
            }
            res.writeHead(200, {'content-type': 'application/json;charset=utf-8'});
            res.end(JSON.stringify(result));
        });
        return;
    }

    res.writeHead(404);
    res.end("请求的端口名称不存在");


});
server.listen(99, function () {
    console.log("服务器搭建成功，正在监听99端口~");
});