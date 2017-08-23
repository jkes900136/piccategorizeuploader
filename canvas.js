
jQuery(function($) {


    // API KEY資訊 
    $('#labelapikey').click(function() {
        $('#apikey').slideToggle('slow');
    });

    var inputImg;
    var inputCanvas = $('<canvas>').appendTo($('#input-view')).get(0);
    var inputCxt;

    // 警告文字 alert 
    function alert(text) {
        window.alert(text);
    }

    // 檢查圖片是否存在
    function checkImage () {
        if (($(inputImg).length  > 0) === false ) {
            alert('not image.');
            return false;
        }
        return true;
    }

    
    // 檢查檔案類型
    function checkFileType(text) {
        
        if (text.match(/^image\/(png|jpeg|gif)$/) === null) {
            alert('Is not an image file');
            return false;
        }
        return true;
    }

    
    // 圖片處理
    function read(reader) {
        return function() {
            
            inputImg = $('<img>').get(0);
            inputImg.onload = function() {
                try {
                    var inputWidth = $('#input-view').width();
                    // resize image
                    if (inputWidth < inputImg.width) {
                        var scale = inputWidth / inputImg.width;
                        dstWidth = inputImg.width * scale;
                        destHeight = inputImg.height * scale;
                        inputCanvas.width = inputWidth;
                        inputCanvas.height = inputImg.height * scale;
                        inputCxt.clearRect(0, 0, inputCanvas.width, inputCanvas.height);
                        inputCxt.drawImage(inputImg, 0, 0, inputImg.width, inputImg.height, 0, 0, dstWidth, destHeight);
                    } else {
                        inputCanvas.width = inputImg.width;
                        inputCanvas.height = inputImg.height;
                        inputCxt.clearRect(0, 0, inputCanvas.width, inputCanvas.height);
                        inputCxt.drawImage(inputImg, 0, 0, inputImg.width, inputImg.height);
                    }
                } catch (e) {
                    alert('couldn\'t load image');
                }
            };
            inputImg.setAttribute('src', reader.result);
            $('pre#result').text('');
        };
    }

    // Browse file
    $('#getimg').change (function() {
        var file, reader;

        
        file = this.files[0];

        // Check File Type
        if (checkFileType(file.type) === false) {
            return false;
        }

        // 取得畫面
        inputCxt = inputCanvas.getContext('2d');

        // 圖片轉DataURL暫存
        reader = new FileReader();
        reader.onload = read(reader);
        reader.readAsDataURL(file);

    });

    // Browse file to upload
    $('#upload').change (function() {
        var file, reader;
        
        file = this.files[0];

        // Check File Type
        if (checkFileType(file.type) === false) {
            return false;
        }

        // 取得畫面
        inputCxt = inputCanvas.getContext('2d');

        // 圖片轉DataURL暫存
        reader = new FileReader();
        reader.onload = read(reader);
        reader.readAsDataURL(file);

    });

    
    $('#input-view').get(0).ondragover = function() {
        return false;
    };

    
    $('#input-view').get(0).ondrop = function(event) {

        var dt, file, reader, droptype, imageurl, imagefile;

        dt = event.dataTransfer;
        droptype = dt.types[0];
        // 檢查拖曳物件類型
        if (droptype == 'Files') {
            file = event.dataTransfer.files[0];
        } else {
            alert('couldn\'t open image.');
            return false;
        }

        // 檢查檔案類型
        if (checkFileType(file.type) === false) {
            return false;
        }

        // 取得畫面
        inputCxt = inputCanvas.getContext('2d');

        // 圖片轉DataURL暫存
        reader = new FileReader();
        reader.onload = read(reader);
        reader.readAsDataURL(file);
        
        return false;
    };

    
    $('#getResult').click(function() {

        apikey = 'AIzaSyC2CS_k14sP-V9TyDN6m4ZM-s0anElhgeQ'; //$('#apikey').val()
        requestURI = 'https://vision.googleapis.com/v1/images:annotate?key='+apikey;
        apiType = $('#apitype').val();
        maxResult = $('#maxresult').val();

        if (apikey.length === 0) {
            alert('API KEY 不正確！ Incorrect!');
            return false;
        }
        if (apiType.length === 0) {
            alert('API 類型有誤! API type Incorrect!');
            return false;
        }
        if (checkImage() === false) {
            alert('檢查圖片 Check image!');
            return false;
        }

        // 顯示Loading
        $('pre#result').text('載入中 Loading');

        var dataURL = inputCanvas.toDataURL();
        var imgDataArray = dataURL.split(",");
        var imgData = imgDataArray[1];

        // request主體
        var requestBody = {
                "requests":{
                    "image":{
                        "content": imgData
                    },
                    "features":{
                        "type": apiType
                        ,"maxResults":maxResult
                    }
                }
            }

        // POST and receive result
        $.ajax({
            type: 'POST',
            url: requestURI,
            data: JSON.stringify(requestBody),
            contentType: 'application/json',
            dataType: 'json',
            success: function(response){

                result =  JSON.stringify(response, null, '  ');
                $('pre#result').text(result);
				//window.alert('Done!');
				var forTable = $("#table tbody");
				var Label = response.responses[0].labelAnnotations;
				
				var LabelCount = Label.length;			
				for(var i = 0; i < LabelCount; i++){
				
				forTable.append("<tr>" +
							"<td>" + (i+1) + "</td>" +
							"<td>" + Label[i].description + "</td>" +
							"<td>" + Label[i].mid + "</td>" +
							"<td>" + Label[i].score.toFixed(2) + "</td>" +
							"<td>" + Label[i].score.toFixed(2)*100 + "</td>" +
							"<td> None </td>" +
						"</tr>");
				
				}
            },
            error: function(req, err){
                $('pre#result').text(req.responseText);
            }
        });

    });

});
