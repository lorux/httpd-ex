

var me = document.location.href
if(me.endsWith("/")) {
  me = me.slice(0,-1);
}

const {render, html, svg} = lighterhtml


function countdown(s,e){

    let t = e - s;

    if (t >= 0) {
        let days = Math.floor(t / (1000 * 60 * 60 * 24));
        let hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let mins = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
        let secs = Math.floor((t % (1000 * 60)) / 1000);
        let ms = t % 1000

        days = `${days}`.padStart(2,'0')
        hours = `${hours}`.padStart(2,'0')
        mins = `${mins}`.padStart(2,'0')
        secs = `${secs}`.padStart(2,'0')
        ms = `${ms}`.padStart(3,'0')

        return `${days}d ${hours}:${mins}:${secs}:${ms}`
    }

    return ""

}

var jobs = []
var highlighted={}

function groupBy(jobList=[]){
    var groups = {}

    jobList.forEach(element => {
        if(!groups[element.name]){
            groups[element.name] = []
        }
        groups[element.name].push(element)
    });

    return groups
}

var updated = {}

var jobsNames = {
jobName_generaRendicontazioneBollo: 'Genera rendicontazioni bollo',
jobName_annullamentoRptMaiRichiesteDaPm : 'Annullamento RPT mai richieste da PM',
jobName_ftpUpload:'FTP retry upload',
jobName_paInviaRt: 'PA invia RT',
jobName_paRetryPaInviaRtNegative: 'PA retry invia RT negative',
jobName_pspChiediAvanzamentoRpt: 'PSP chiedi avanzamento RPT',
jobName_pspChiediListaAndChiediRt: 'PSP chiedi lista e chiedi RT',
jobName_pspNotificaCancellazione: 'PSP notifica cancellazione',
jobName_pspRetryAckNegative: 'PSP retry ACK negative',
jobName_pspRetryNotificheCancellazioneRpt: 'PSP retry notifiche cancellazione',
jobName_refreshConfiguration: 'Refresh configurazione',
jobName_rtPullRecoveryPush: 'Rt pull recovery canali push'
}

function jobsStatus(node,jobList=[],date,init=false){

    jobList.map(j=>{
        if(jobs.find(jo=> jo.name == j.name && jo.key == j.key && jo.start!= j.start)){
            updated[j.id]=true
            setTimeout(()=>{
                updated[j.id]=false
            },5000)
        }

        var now = new Date()
        var d = new Date(j.start)

        if(j.status=='RUNNING' && now.getTime()-d.getTime()>(1000*600)){
            j.error=true
        }

    })

    jobs = jobList

    var groups = groupBy(jobList)

    var keys = Object.keys(groups)

    var l = keys.length/2

    render(node,()=>html`
        ${keys.map((k,i)=>{
            var jjj = groups[k]
            return html`
            <div class="jobBox col s12 m12 l12 xl6">
                <table class="striped highlight">
                <caption>${jobsNames[k]}</<caption>
                    <thead>
                        <th>Key</th>
                        <th>Status</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Duration</th>
                    </thead>
                    <tbody>
                        ${jjj.map(job=>{

                            var s = new Date(job.start)
                            var e = new Date(date)
                            if(job.end){ e = new Date(job.end) }

                            return html`
                                <tr class="${job.status} ${job.error?'hoverable error':'hoverable'}${updated[job.id]>0?' jobhighlight':''}">
                                    <td><span>${job.key}</span></td>
                                    <td><span>${job.status}</span>${job.status=='RUNNING'?html`<a class="resetbutton" data-descr="${job.name}" data-job="${job.id}" href="#" onclick="${resetJob}">Reset</a>`:''}</td>
                                    <td><span>${job.start}</span></td>
                                    <td><span>${job.end}</span></td>
                                    <td><span>${countdown(s,e)}</span></td>
                                </tr>
                            `})
                        }
                    </tbody>
                </table>
            </div>
        `
        })}
    `)

    function resetJob(e){
        e.preventDefault()
        if(e.target.tagName=='A'){
            var id = e.target.dataset.job
            var descr = e.target.dataset.descr
            fetch(`jobs/reset?id=${id}`,{cache: "no-cache"}).then(resp=>{
                resp.text().then(text=>{
                    if(resp.ok)
                        M.toast({html: `${descr} resetted`})
                    else {
                            M.toast({html: `${descr} not resetted`,classes: 'error'})
                            console.log(text)
                        }
                })
            }).catch(err=>{
                   M.toast({html: `Error:${err}`,classes: 'error'})
            })
        }
    }

    function refresh(){
        fetch(`/jobsStatus`,{cache: "no-cache"}).then(data=>data.json()).then(d=>{
            jobsStatus(node,d.jobs,d.date,true)
        }).catch(err=>{
            console.log(err)
        })
    }

    setTimeout(refresh,1000)

}

var js = document.querySelector('#jobsStatus')
fetch(`/jobsStatus`,{cache: "no-cache"}).then(data=>data.json()).then(d=>{
    jobsStatus(js,d.jobs,d.date,true)
}).catch(err=>{
    console.log(err)
})