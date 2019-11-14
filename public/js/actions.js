

var me = document.location.href
if(me.endsWith("/")) {
  me = me.slice(0,-1);
}
var defaultRestInputUrl = document.location.origin.replace("seed","rest-input")

if(document.location.origin.indexOf("localhost")> -1){
    defaultRestInputUrl = "http://localhost:8081"
}else{
    defaultRestInputUrl = document.location.origin.replace("seed","rest-input")
}

document.querySelector('#restInputUrl').innerHTML = `(${defaultRestInputUrl})`
document.querySelector('#resetRunningJob').addEventListener('click',resetRunningJob)
document.querySelector('#checkStatus').addEventListener('click',checkStatus)

if(document.location.hostname =='localhost'){
    document.querySelector('#restInputUrl').value = 'http://localhost:8081'
}

function checkStatus(){
    var restInputUrl = defaultRestInputUrl
    fetch(`${defaultRestInputUrl}/health`,{cache: "no-cache"}).then(data=>data.text()).then(resp=>{
        M.toast({html: 'Status:'+resp})
    }).catch(err=>{
        M.toast({html: `Error:${err}`,classes: 'error'})
    })
}
function resetRunningJob(){
    var restInputUrl = defaultRestInputUrl
    fetch(`/resetRunningJob`,{cache: "no-cache"}).then(data=>data.text()).then(resp=>{
        M.toast({html: resp})
    }).catch(err=>{
        M.toast({html: `Error:${err}`,classes: 'error'})
    })
}





var rj = document.querySelector('#runningJobs')
function checkJobs(){
    var restInputUrl = defaultRestInputUrl
    setTimeout(()=>{
        fetch(`/jobs/checkRunningJobs`,{cache: "no-cache"}).then(data=>data.text()).then(number=>{
            rj.innerHTML=number
            checkJobs()
        }).catch(err=>{
            rj.innerHTML="Error"
        })

    },1000)
}

checkJobs()

const {render, html, svg} = lighterhtml


function jobs(node,jobList=[],init=false){

    render(node,()=>html`
        <b>Jobs</b>
        <div class="flex">
        <ul class="collection">
                ${jobList.map((job,i)=>{
                    return html`
                    <li class=${job.enabled + " collection-item"} class="collection-item">
                          <span class="title"}><b>${job.description}</b></span> (${job.cron})
                          ${job.enabled == 'enabled'?html`<a class="secondary-content" data-descr="${job.description}" href="${defaultRestInputUrl}/jobs/trigger/${job.job}" onclick="${triggerJob}"><i class="material-icons">play_arrow</i></a>`:''}
                        </li>
                    `})
                }
        </ul>
        </div>
    `)

    function loadjobs(){
        console.log('loading')
        fetch(`/jobs`,{cache: "no-cache"}).then(data=>data.json()).then(d=>{
            jobs(node,d,true)
        }).catch(err=>{
            console.log(err)
        })
    }

    function triggerJob(e){
        e.preventDefault()
        if(e.target.parentNode.tagName=='A'){
            var thref = e.target.parentNode.href
            var descr = e.target.parentNode.dataset.descr
            fetch(thref,{cache: "no-cache"}).then(resp=>{
                resp.text().then(text=>{
                    if(resp.ok)
                        M.toast({html: `${descr} triggered`})
                    else {
                        M.toast({html: `${descr} not triggered`,classes: 'error'})
                            console.log(text)
                        }
                })
            }).catch(err=>{
                M.toast({html: err,classes: 'error'})
            })
        }

    }
    if(!init){
        loadjobs()
    }

}


function keys(node,keyList=[],init=false){
    render(node,()=>html`
        <b>Refreshable Keys</b>
        <ul class="collection">
            ${keyList.map(k=>{
                return html`
                    <li class="collection-item" >
                        ${k.refreshableKey}
                        <a data-key="${k.refreshableKey}" href="${defaultRestInputUrl}/config/refresh/${k.refreshableKey}" onclick="${refreshKey}" class="secondary-content"><i class="material-icons">refresh</i></a>
                    </li>
                `})
            }
        </ul>
    `)

    function loadkeys(){
        fetch(`/keys`,{cache: "no-cache"}).then(data=>data.json()).then(d=>{
            keys(node,d,true)
        }).catch(err=>{
            console.log(err)
        })
    }
    function refreshKey(e){
        e.preventDefault()
        if(e.target.parentNode.tagName=='A'){
            var thref = e.target.parentNode.href
            var key = e.target.parentNode.dataset.key

              fetch(thref,{cache: "no-cache"}).then(resp=>{
                  resp.text().then(text=>{
                      if(resp.ok && text === 'SUCCESS')
                            M.toast({html: `${key} refreshed`})
                      else {
                            M.toast({html: `${key} refresh error`})
                              console.log(text)
                          }
                  })
              }).catch(err=>{
                M.toast({html: `${key} error: ${err}`,classes: 'error'})
              })
        }

    }

    if(!init){
        loadkeys()
    }

}

var jj = document.querySelector('#jobs')
jobs(jj)
var kk = document.querySelector('#keys')
keys(kk)