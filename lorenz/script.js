function replace(){
    var lines = document.querySelectorAll(".log-line-text")
    Array.prototype.forEach.call(lines,function(t,a){
        var r=t.textContent;
        try{
          var p=JSON.parse(r.trim().replace(/(\\ ")/g,'\\"'))
          var color="#FFF";
          switch(p.app.level_value){
            case 3e4:
              color="yellow";
              break;
            case 4e4:
              color="red";
              break;
            case 2e4:
              color="#27D507"
              break;
            case 1e4:
              color="cyan"
          }
  
          var i = document.createElement('td')
          i.innerHTML = "<span style=\"color:grey\">["+p.app.bundleName+":"+p.app.bundleVersion+'] [<span style="color:'+color+'">'+p.app.level+"</span>] ["+p.app.apptimestamp+"] ["+(p.app.sessionId||"no_session")+"] ["+p.app.logger_name+"] </span>"
          var s = document.createElement('span')
          s.textContent = p.message
          i.appendChild(s)
          t.parentNode.replaceChild(i, t);
          if(p.app.stack_trace){
            var n=document.createElement("span");
            n.style.color='red'
            n.innerHTML=p.app.stack_trace.replace(/\n/g,'<br>')
            i.appendChild(document.createElement("br"))
            i.appendChild(n)
          }
  
        }catch(c){
          t.className=".log-line-text-mod"
        }
      }
    )
    
  }
  replace();
  
  var targetNode=document.querySelector(".log-view"),config={attributes:!0,childList:!0,subtree:!0},callback=function(mutationsList,observer){replace()},observer=new MutationObserver(callback);observer.observe(targetNode,config);