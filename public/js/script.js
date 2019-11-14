

var me = document.location.href
if(me.endsWith("/")) {
  me = me.slice(0,-1);
}

var autoref = true
function toggleAutoRefresh(){
    autoref=!autoref
}

function htmlToElements(html) {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
}

var rolesShow=false

function toggleRoles(){
    rolesShow= !rolesShow
    if(rolesShow){
        document.querySelector('#memberscontainer').classList.remove('hideRoles')
    }else{
        document.querySelector('#memberscontainer').classList.add('hideRoles')
    }
}

function getBundleName(roles){
    return roles.find(r=>r.startsWith('status_')).replace('status_','')
}

document.querySelector('#autorefresh').addEventListener('change',toggleAutoRefresh)

var statusBundles = []

function getStatus(){
    setTimeout(()=>{
        fetch(`/web/status`,{cache: "no-cache"}).then(data=>data.json()).then(daaaa=>{
            statusBundles=daaaa
        }).catch(err=>{
            getStatus()
        })

    },1000)
}
getStatus()

function getBundleVersion(name){
    if(!statusBundles) return ''
    var f = statusBundles.find(s=>s.name==name)
    if(f){
        return f.version
    }
    return ''
}

const {render, html, svg} = lighterhtml


function mems(node,members=[]){
    render(node,()=>{
        var grouped = {}
        members.forEach(m=>{
            var name = getBundleName(m.roles)
            if(!grouped[name]){
                grouped[name] = m
                grouped[name].name=name
                grouped[name].number = 0
                grouped[name].addresses = []
            }
            grouped[name].number++
            grouped[name].addresses.push({
                node:m.node,
                status:m.status
            })
        })

        var bundles = Object.keys(grouped)
        return html`
            <table class="striped highlight">
                <caption>
                    <h6>${bundles.length} Bundles in ${members.length} Nodi
                        <div class="switch">
                            <label>Show Roles<input type="checkbox" id="showroles" onchange=${toggleRoles}>
                                <span class="lever"></span>
                            </label>
                        </div>
                    </h6>
                </caption>
                <thead>
                    <tr>
                        <th>Bundle</th>
                        <th>Version</th>
                        <th class="roles">Roles</th>
                        <th>Address/Status</th>
                    </tr>
                </thead>
                <tbody id="members">
                    ${bundles.sort((a,b)=>{
                        return a.localeCompare(b)
                    }).map(bundleName=>{
                        return html`
                            <tr>
                              <td class="bundle">${grouped[bundleName].number} x ${bundleName}</td>
                              <td class="version">${getBundleVersion(bundleName)}</td>
                              <td class="roles">
                                  ${grouped[bundleName].roles.map(r=>{return html`<div>${r}</div>`})}
                              </td>
                              <td class="memberaddress">${grouped[bundleName].addresses.map(a=>html`<div>${a.node} <span class="${a.status}">${a.status}</span></div>`)}</td>
                          </tr>`})
                    }
                </tbody>
            </table>
        `})

    function refresh(){
        if(autoref) fetch("/cluster/members",{cache: "no-cache"}).then(data=>data.json()).then(data=>{
            mems(node,data.members)
        })
    }

    setTimeout(refresh,1000)
}

function evts(node,events=[]){
    render(node,()=>html`
        <table class="striped highlight">
            <caption><h6>Eventi</h6></caption>
            <thead>
            <tr>
                <th>Time</th>
                <th>Bundle</th>
                <th>Type</th>
                <th>Status</th>
            </tr>
            </thead>
            <tbody id="events">
                ${events.map(evt=>{
                    var time = /(\d\d\d\d-\d\d-\d\d).(\d\d:\d\d:\d\d[.]\d\d\d)/.exec(evt.time)
                    return html`<tr>
                                <td>${time[1]+' '+time[2]}</td>
                                <td><b>${evt.bundle}</b> (${evt.address})</td>
                                <td>${evt.type}</td>
                                <td>${evt.status}</td>
                            </tr>`
                })}
            </tbody>
        </table>
    `)
}


var mm = document.querySelector('#memberscontainer')
fetch("/cluster/members",{cache: "no-cache"}).then(data=>data.json()).then(data=>{
    mems(mm,data.members)
})
var ev = document.querySelector('#eventscontainer')
var evtSource = new EventSource("/events");
evts(ev,[])
evtSource.onmessage = function(e){
    if(autoref && e.data) evts(ev,JSON.parse(e.data))
}
