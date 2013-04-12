
var fileAPI = {
    dropFileCLASS:            "dropFile",    // Class Name you want to have drop function
    dropFileAreas:            "",            // have drop function of HTML Element
    index:                    0,
    files:                    {},            // files info of user drop
    progress:                 {},
    progressCLASS:            "percent",     // the percent of read file
    readProgressBarCLASS:     "readProgressBar", // Class Name you want to show the progress
    picID:                    "pic",         // the picture ID of your drop file
    picURL:                   "",            // picture's URL will be show in result DIV
    result:                   {},            // info of upload files 
    resultCLASS:              "result",
    resultTemplate:           "\
    <div id='{ picID }{ j }' class='row-fluid'>\
        <div class='span2'>\
            <img class='margin10 thumb' src='http://fakeimg.pl/250x150' class='thumb' alt=''/>\
        </div>\
        <div class='span6'>\
            <div>{ name }</div>\
            <div class='{ readProgressBarCLASS }'>\
                <div class='percent'>0%</div>\
            </div>\
        </div>\
        <div class='span2'>\
            <button class='btn btn-danger' onclick='fileAPI.delPic({ j })'><i class='icon-trash icon-white'></i><span>Delete</span></button>\
        </div>\
    </div>",
    resultTemplateArg:        {},
    serverURL:                "",
    uploadProgressBarCLASS:   "uploadProgressBar",
    formData:                 null,
    upLoaded:                 {},
    uploadPercentLoaded:      0,
    uploadTotal:              0,
    xhrs:                     {},

    buttonBind: {
        uploadCLASS: "uploadToServer"
    },
    callBack: {
        uploadToServer: null
    },

    fileIconURL: {
        "application/pdf":                                                              "http://dl.dropbox.com/u/35861696/WebTools/fileAPI/icon/Adobe-PDF-Document-icon.png",
        "text/csv":                                                                     "http://dl.dropbox.com/u/35861696/WebTools/fileAPI/icon/Mimetypes-txt-icon.png",
        "application/msword":                                                           "http://dl.dropbox.com/u/35861696/WebTools/fileAPI/icon/Word-icon.png",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":      "http://dl.dropbox.com/u/35861696/WebTools/fileAPI/icon/Word-icon.png",
        "application/vnd.ms-excel":                                                     "http://dl.dropbox.com/u/35861696/WebTools/fileAPI/icon/Excel-icon.png",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":            "http://dl.dropbox.com/u/35861696/WebTools/fileAPI/icon/Excel-icon.png",
        "application/vnd.ms-powerpoint":                                                "http://dl.dropbox.com/u/35861696/WebTools/fileAPI/icon/PowerPoint-icon.png",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation":    "http://dl.dropbox.com/u/35861696/WebTools/fileAPI/icon/PowerPoint-icon.png",
        "application/vnd.oasis.opendocument.text":                                      "http://dl.dropbox.com/u/35861696/WebTools/fileAPI/icon/OpenOffice-Writer-icon.png",
        "application/vnd.oasis.opendocument.spreadsheet":                               "http://dl.dropbox.com/u/35861696/WebTools/fileAPI/icon/OpenOffice-Calc-icon.png",
        "application/vnd.oasis.opendocument.presentation":                              "http://dl.dropbox.com/u/35861696/WebTools/fileAPI/icon/OpenOffice-Impress-icon.png",
        "application/zip":                                                              "http://dl.dropbox.com/u/35861696/WebTools/fileAPI/icon/Mimetypes-zip-icon.png",
        "application/x-rar":                                                            "http://dl.dropbox.com/u/35861696/WebTools/fileAPI/icon/Mimetypes-rar-icon.png",
        "application/x-gzip":                                                           "http://dl.dropbox.com/u/35861696/WebTools/fileAPI/icon/Mimetypes-tar-icon.png",
        "":                                                                             "http://dl.dropbox.com/u/35861696/WebTools/fileAPI/icon/Mimetypes-txt-icon.png",
        "text/html":                                                                    "http://dl.dropbox.com/u/35861696/WebTools/fileAPI/icon/Mimetypes-txt-icon.png",
        "text/plain":                                                                   "http://dl.dropbox.com/u/35861696/WebTools/fileAPI/icon/Mimetypes-txt-icon.png"
    },
    
    // File Drag and Drop Event function
    onDrop:      function (event) {
        event.preventDefault();
        $(this).removeClass('hover');
        $("." + fileAPI.uploadProgressBarCLASS).show();
        $("." + fileAPI.buttonBind.uploadCLASS).show();
        fileAPI.files = event.originalEvent.dataTransfer.files;
        
        var file = null;
        for(var i=0, max=fileAPI.files.length; i<max; i++) {
            file = fileAPI.files[i];
            console.log('file name:    ' + file.name + '\n' +
                        'content-type: ' + file.type + '\n' +
                        'size:         ' + file.size + ' Byte\n');
            fileAPI.result[fileAPI.index+i] = {
                "file" :file
            };
            fileAPI.readAs(fileAPI.index+i);
        }
        fileAPI.index = fileAPI.index + fileAPI.files.length;
    },
    onDragover:  function (event) {
        event.preventDefault();
        $(this).addClass('hover');
    },
    onDragleave: function (event) {
        $(this).removeClass('hover');
    },    


    readAs: function readAs(j) {
        var reader = null;

        if (/\w*/.exec(fileAPI.result[j].file.type)[0] == "image") {
            reader = new FileReader();
            reader.readAsDataURL(fileAPI.result[j].file);

            reader.onloadstart = (function (event) { fileAPI.onLoadstart(event, j); });
            reader.onprogress  = (function (event) { fileAPI.onProgress(event, j); });
            reader.onload      = (function (     ) { fileAPI.onLoad(this, j); });
            // reader.onloadend   = fileAPI.onLoadend;
            // reader[j].onabort     = (function (index) { fileAPI.onAbort(index, j) });
            reader.onerror     = fileAPI.onError;
        } else {
            fileAPI.onLoadstart(event, j);
            fileAPI.onLoad(this, j);
        }
    },
    
    
    // File Read Event function
    onLoadstart: function onLoadstart(event, j) {
        console.log("run onLoadstart()");

        var resultTemplate = fileAPI.resultTemplate;
        resultTemplateArg = {
            name:                   fileAPI.result[j].file.name,
            type:                   fileAPI.result[j].file.type,
            size:                   fileAPI.result[j].file.size,
            picID:                  fileAPI.picID,
            j:                      j,
            readProgressBarCLASS:   fileAPI.readProgressBarCLASS,
            uploadProgressBarCLASS: fileAPI.uploadProgressBarCLASS
        };

        resultTemplate = stringAPI.printfByName(resultTemplate, resultTemplateArg);
        
        // TODO: 有辦法把resultTemplateArg獨立開來讓使用者自行設計嗎
        $('.' + fileAPI.resultCLASS).append(resultTemplate);
        fileAPI.progress[j.toString()] = $("#" + fileAPI.picID + j + " ." + fileAPI.progressCLASS);
        fileAPI.progress[j.toString()].css("width", '0%').text("0%");
        
        $("#" + fileAPI.picID + j + " ." + fileAPI.readProgressBarCLASS).addClass('loading');
    },
    onProgress:  function onProgress(event, j) {
        console.log("run onProgress()");
        // event is an ProgressEvent.
        if (event.lengthComputable) {
            var percentLoaded = Math.round((event.loaded / event.total) * 100);
            // Increase the progress bar length.
            if (percentLoaded < 100) {
                fileAPI.progress[j.toString()].css("width", percentLoaded + '%').text(percentLoaded + '%');
                console.log(percentLoaded + '%');
            }
        }
    },
    onLoad:      function onLoad(that, j) {
        console.log("run onLoad()");
        fileAPI.progress[j.toString()].css("width", '100%').text('100%');
        var tmp = "$('#" + fileAPI.picID + j + " ." + fileAPI.readProgressBarCLASS + "').removeClass('loading');";
        setTimeout(tmp, 1500);
        if (typeof fileAPI.fileIconURL[fileAPI.result[j].file.type] == "undefined") {
            fileAPI.picURL = that.result;
        } else {
            fileAPI.picURL = fileAPI.fileIconURL[fileAPI.result[j].file.type];
        }
        $('#' + fileAPI.picID + j + " img").attr("src", fileAPI.picURL);
    },
    // onLoadend:   function onLoadend(event) {
    //     console.log("run onLoadend()");
    // },
    // onAbort:     function onAbort(index, j) {
    //     console.log("run onAbort()");
    // },
    onError:     function onError(event) {
        switch(event.target.error.code) {
            case event.target.error.NOT_FOUND_ERR:
                console.log("File Not Found!");
                break;
            case event.target.error.SECURITY_ERR:
                console.log("Security Error!");
            case event.target.error.ABORT_ERR:
                console.log("Abort Error!");
                break; // noop
            case event.target.error.NOT_READABLE_ERR:
                console.log("You have no right to Read File!");
                break;
            case event.target.error.ENCODING_ERR:
                console.log("File Encoding Error!");
                break;
            default:
                console.log("An error occurred reading this file.");
        };
    },
    
    // Del file in File List    // ToDo.
    delPic: function delPic(j) {
        console.dir("run delPic(" + j + ")");
        if(fileAPI.xhrs[j]) {
            fileAPI.xhrs[j].abort();
            fileAPI.uploadTotal = fileAPI.uploadTotal - fileAPI.result[j].file.size;
        }
        delete fileAPI.result[j];
        $('#' + fileAPI.picID + j).remove();
        if($.isEmptyObject( fileAPI.result)) {
            $("." + fileAPI.uploadProgressBarCLASS).hide();
            $("." + fileAPI.buttonBind.uploadCLASS).hide();
            $("." + fileAPI.uploadProgressBarCLASS + " ." + fileAPI.progressCLASS).css("width", '0%').text("0%");
        }
    },

    // Files upload to Server   // ToDo.
    uploadToServer: function uploadToServer(event) {
        console.log("run upToServer()");
        $("." + fileAPI.uploadProgressBarCLASS + " ." + fileAPI.progressCLASS).css("width", '0%').text("0%");
        $("." + fileAPI.uploadProgressBarCLASS).addClass('loading');

        fileAPI.uploadTotal = 0;
        for (var j in fileAPI.result) {
            console.log("fileAPI.result[" + j + "]: " + fileAPI.result[j]);
            fileAPI.formData = new FormData();
            fileAPI.formData.append("file",     fileAPI.result[j].file);

            // 把圖片的標題與描述寫入fileAPI.result
            if( event.data.callback && typeof(event.data.callback) === "function") {
                event.data.callback(j);
            }

            var xhr = new XMLHttpRequest();
            xhr.upload.onloadstart = (function (event) { fileAPI.onUpLoadstart(event, j); });
            xhr.upload.onprogress  = (function (j) { 
                return function(event) {
                    fileAPI.onUploadProgress(event, j);
                };
            }(j));
            xhr.upload.onload      = (function (j) {
                return function(event) {
                    fileAPI.onUpload(event, j);
                };
            }(j));
            xhr.upload.onabort     = (function (event) { fileAPI.onUploadAbort(event, j); });
            xhr.open('POST', "http://" + fileAPI.serverURL + "/sys/fileupload", true);
            xhr.send(fileAPI.formData);
            fileAPI.xhrs[j] = xhr;  // prepare for abort

            fileAPI.uploadTotal = fileAPI.uploadTotal + fileAPI.result[j].file.size;
        }
    },
    onUpLoadstart: function onUpLoadstart(event, j) {
        console.log("run onUpLoadstart()");
        fileAPI.progress[j].css("width", '0%').text("0%");
        $("#" + fileAPI.picID + j + " ." + fileAPI.readProgressBarCLASS).addClass('loading');
    },
    onUploadProgress: function onUploadProgress(event, j) {
        console.log("run onUploadProgress()");
        if (event.lengthComputable) {
            var percentLoaded = Math.round((event.loaded / event.total) * 100);
            fileAPI.progress[j].css("width", percentLoaded + '%').text(percentLoaded + '%');
            console.log("upload percentLoaded: " + percentLoaded);

            fileAPI.upLoaded[j] = event.loaded;
            fileAPI.upLoaded["sum"] = 0;
            for( i in fileAPI.result) {
                fileAPI.upLoaded["sum"] = fileAPI.upLoaded["sum"] + fileAPI.upLoaded[i];
            }
            fileAPI.uploadPercentLoaded = Math.round((fileAPI.upLoaded["sum"] / fileAPI.uploadTotal) * 100);
            $("." + fileAPI.uploadProgressBarCLASS + " ." + fileAPI.progressCLASS).css("width", fileAPI.uploadPercentLoaded + '%').text(fileAPI.uploadPercentLoaded + "%");
        }
    },
    onUpload: function onUpload(event, j) {
        console.log("uploadToServer() SUCCESS.");
        var tmp1 = "$('#" + fileAPI.picID + j + " ." + fileAPI.readProgressBarCLASS + "').removeClass('loading');";
        setTimeout(tmp1, 1500);

        if(fileAPI.uploadPercentLoaded == 100) {
            var tmp2 = "$('." + fileAPI.uploadProgressBarCLASS + "').removeClass('loading');";
            setTimeout(tmp2, 1500);
        }
    },
    onUploadAbort: function onUploadAbort(event, j) {
        console.log("upload abort: " + this.status);
    },

    // Init fileAPI Library
    init: function init() {
        // Binding onDrop, onDragover, onDragleave Event function to special HTML Element
        // When use jQuery bind function, modify event.dataTransfer TO event.originalEvent.dataTransfer！！
        $("." + fileAPI.dropFileCLASS).bind("drop"      , fileAPI.onDrop)
                                      .bind("dragover"  , fileAPI.onDragover)
                                      .bind("dragleave" , fileAPI.onDragleave);
        
        // Binding Buttons to have special file read function
        $("." + fileAPI.buttonBind.uploadCLASS).bind("click", { callback: fileAPI.callBack.uploadToServer }, fileAPI.uploadToServer);
    }
};
