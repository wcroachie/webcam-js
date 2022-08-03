/*
*  run by invoking window["path/to/webcam.js"]();
*
*/

window[new Error().stack.match(location.href.match(/(.*)\//g)+"(.*?):")[1]]=()=>{
  
  
  
  if(!((location.protocol==="https:")||location.host.includes("localhost"))){
    console.warn("getUserMedia() must be run from a secure origin: HTTPS or localhost."+"\n\nChanging protocol to HTTPS");
    location.protocol="HTTPS";
  }
  
  // creates button that always works
  function createButton(msg,onActivationCallback){
    var a=document.createElement("a");
    a.__click=()=>{
      onActivationCallback();
    };
    a.id="_"+crypto.randomUUID();
    a.href=("Xjavascript:document.querySelector('#"+a.id+"').__click();").replace("X","");
    a.appendChild(document.createTextNode(msg));
    return a;
  }
  
  function openAudioStream(callback){
    navigator.mediaDevices.getUserMedia({audio:true,video:false,}).then((stream)=>{
      console.log("audio stream opened");
      callback(stream);
    });
  }
  
  function openVideoStream(callback){
    navigator.mediaDevices.getUserMedia({audio:false,video:true,}).then((stream)=>{
      console.log("video stream opened");
      callback(stream);
    });
  }
  
  function openAudioStreamAt(audioDeviceId,callback){
    navigator.mediaDevices.getUserMedia({audio:{deviceId:{exact:audioDeviceId,},},video:false,}).then((stream)=>{
      console.log("audio stream opened at "+audioDeviceId);
      callback(stream);
    }).catch((err)=>{
      console.error(err);
    });
  }
  
  function openVideoStreamAt(videoDeviceId,callback){
    navigator.mediaDevices.getUserMedia({audio:false,video:{deviceId:{exact:videoDeviceId,},},}).then((stream)=>{
      console.log("video stream opened at "+videoDeviceId);
      callback(stream);
    }).catch((err)=>{
      console.error(err);
    });
  }
  
  
  function closeStream(stream){
    stream.getTracks().forEach((each)=>{
      each.stop();
      stream.removeTrack(each);
    });
    console.log("stream closed.");
  }
  
  function getDevices(callback){
    // note that stream must be opened already to get all the device info
    navigator.mediaDevices.getUserMedia({audio:true,video:true,}).then((tempStream)=>{
      navigator.mediaDevices.enumerateDevices().then((devices)=>{
        closeStream(tempStream);
        var audioDevices=devices.filter(e=>e.kind==="audioinput");
        var videoDevices=devices.filter(e=>e.kind==="videoinput");
        callback(audioDevices.map(e=>[e.deviceId,e.label]),videoDevices.map(e=>[e.deviceId,e.label]));
      });
    });
  }
  



  // always treat video and audio streamds separately

  var openStreamButton=(function(){
    return createButton("<open stream>",()=>{
      
      var tempReplacer=document.createTextNode("loading...");
      openStreamButton.replaceWith(tempReplacer);
      
      var container=document.createElement("div");
      container.style.backgroundColor="lightgray";
      
      getDevices((audioDevices,videoDevices)=>{
        
        var audioSourceSelect = document.createElement("select");
        var videoSourceSelect = document.createElement("select");
        var video = document.createElement("video");
        var audio = document.createElement("audio");
        
        audio.playsInline = true;
        audio.autoplay    = true;
        audio.controls    = true;
        
        video.playsInline = true;
        video.autoplay    = true;
        video.controls    = true;
        
        audioDevices.forEach((each)=>{
          var option          = document.createElement("option");
          option.value        = each[0];
          option.textContent  = each[1];
          audioSourceSelect.appendChild(option);
        });
        
        videoDevices.forEach((each)=>{
          var option          = document.createElement("option");
          option.value        = each[0];
          option.textContent  = each[1];
          videoSourceSelect.appendChild(option);
        });
        
        openAudioStream((audioStream)=>{
          openVideoStream((videoStream)=>{
            
            audio.srcObject=audioStream;
            video.srcObject=videoStream;
            
            audioSourceSelect.onchange=()=>{
              openAudioStreamAt(audioSourceSelect.value,(stream)=>{
                closeStream(audioStream);
                audioStream=stream;
                audio.srcObject=audioStream;
              });
            };
            
            videoSourceSelect.onchange=()=>{
              openVideoStreamAt(videoSourceSelect.value,(stream)=>{
                closeStream(videoStream);
                videoStream=stream;
                video.srcObject=videoStream;
              });
            };
            
            videoSourceSelect.style.display="block";
            audioSourceSelect.style.display="block";
            video.style.display="block";
            audio.style.display="block";
          
            
            var closeStreamButton=createButton("<close stream>",()=>{
              container.remove();
              closeStream(audioStream);
              closeStream(videoStream);
              
              audioStream       = null;
              videoStream       = null;
              video             = null;
              audio             = null;
              videoSourceSelect = null;
              audioSourceSelect = null;
              container         = null;
              
              openStreamButton=arguments.callee();
                            
              openStreamButton.style.position="relative";
              openStreamButton.style.display="block";
              closeStreamButton.replaceWith(openStreamButton);
            });
            closeStreamButton.style.position="relative";
            closeStreamButton.style.display="block";
            tempReplacer.replaceWith(closeStreamButton);
            
            
            container.appendChild(videoSourceSelect);
            container.appendChild(audioSourceSelect);
            container.appendChild(video);
            container.appendChild(audio);
            
            document.body.appendChild(container);
            
          });
        });
        
      });
    });
  })();
  

  openStreamButton.style.position="relative";
  openStreamButton.style.display="block";
  document.body.appendChild(openStreamButton);
  
  
};
