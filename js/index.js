'use strict';
var    svgexport  = require('svgexport');
var    fs  = require('fs');
var    mkdirp  = require('mkdirp');
var    SVGSpriter = require('svg-sprite');
var    SVGSpriterWx = require('svg-sprite-wx');
var    path = require('path');
var    dragDrop = require('drag-drop');
var    glob = require('glob');
var    $ = require('jQuery');

var wxCheck = false; //小程序
//小程序rpx单位
$("#wxCheck").click(function(){
    wxCheck == false ? wxCheck=true : wxCheck=false;    
    if(wxCheck){
        $(this).addClass("act");
        console.log("wx")
    }else{
        $(this).removeClass("act");
        console.log("not wx")
    }
});

// 拖拽文件
dragDrop('#dropTarget', function (files) {
  var svgPath = []; //svg图标路径
  var svgSpriteDest = path.dirname(files[0].path)+'/sprite/'; //在当前目录新建一个sprite文件夹 
  var svgSpriteOldDest = path.dirname(files[0].path)+'/sprite/'+'*'; //svgsprite目录

    //获取文件信息
    files.forEach(function (file) {
        svgPath.push(file.path);
        var reader = new FileReader()
        reader.addEventListener('load', function (e) {
            var arr = new Uint8Array(e.target.result)
            var buffer = new Buffer(arr)

        })
        reader.addEventListener('error', function (err) {
            console.error('FileReader error' + err)
        })
        reader.readAsArrayBuffer(file);
        console.log(file);

        //判断类型
        if(!(file.type=="image/svg+xml")){
            $("txtDefault").hide();
            $("txtErr").show();
            console.log(file.type);
            process.exit(-1);
        }
        
    })
    console.log("dragFile");

    //svg 处理
    //配置文件
    var config={
        "mode": {
            "css": {
                "dest": svgSpriteDest,
                    "common": "icon", //公用类名
                    "prefix": ".", //单个图标前缀
                    "sprite": "sprite", //svg名前缀
                    "dimensions": true,
                    "render": {
                        "css": true
                    },
                    example : true //预览
            }
        }
    }
    //是否为小程序
    if(wxCheck){
        var spriter       = new SVGSpriterWx(config);
    }else{
        var spriter       = new SVGSpriter(config);
    }
    

    //相关声明
    var svg2pngPattern = svgSpriteDest+'*.svg';  //svg sprite 目录
    
    for(var i=0;i<svgPath.length;i++){
        spriter.add(svgPath[i], null, fs.readFileSync(svgPath[i], {encoding: 'utf-8'}));
    }

    // 生成svg雪碧图
    spriter.compile(function(error, result) {
        for (var type in result.css) {
            mkdirp.sync(path.dirname(result.css[type].path));
            fs.writeFileSync(result.css[type].path, result.css[type].contents);
        }
        console.log("svgSprite")
        //svg to png
        glob(svg2pngPattern, {nodir: true}, function (err, files) {
            if (err) {
                return console.error("svg to png error");
            }
            files.forEach( function (file){
                var datafile =  [ {
                     "input" : [file, "1"],
                     "output": [ [path.dirname(file)+'/'+path.basename(file,'.svg')+'.png', "1"] ]
                }]

                //svg2png
                svgexport.render(datafile, function(){
                    console.log("svg2png")
                });
            });
        })  
    })
    //svg 处理  

    //处理完毕
    $("#txtSuc").show();
    $("#txtDefault").hide();
    setTimeout(function(){
        $("#txtSuc").hide();
        $("#txtDefault").show();
    },1500)      
 
    
})


function delOldSprite(){
    if (fs.existsSync(svgSpriteDest)) {
            //清除上一次操作
            glob(svgSpriteOldDest, {nodir: true}, function (err, files) {
                if (err) {
                    return console.error("svg to png error");
                }
                files.forEach( function (file){
                    fs.unlink(file)
                });
                
            }) ;
            console.log("delSvg")
        }
}
























