let fileSystemTree =[
    {
      isDirectory: true,
      name: 'Test folder',
      child: [
        {
          isDirectory: false,
          name: 'text.txt',
        }
      ]
    },
    {
      isDirectory: false,
      name: 'index.html',
    },
    {
      isDirectory: false,
      name: 'index.php',
    },
    {
      isDirectory: false,
      name: 'textfile.txt',
    },
    {
      isDirectory: false,
      name: 'textfile.exe',
    },
    // 50 additional files and folders
    {
      isDirectory: true,
      name: 'Folder A',
      child: [
        {
          isDirectory: false,
          name: 'fileA1.txt',
        },
        {
          isDirectory: false,
          name: 'fileA2.js',
        },
        {
          isDirectory: true,
          name: 'Subfolder A',
          child: [
            {
              isDirectory: false,
              name: 'fileA3.css',
            },
            // Add more files or folders here as needed
          ]
        },
        // Add more files or folders here as needed
      ]
    },
    {
      isDirectory: false,
      name: 'fileB1.html',
    },
    {
      isDirectory: true,
      name: 'Folder B',
      child: [
        {
          isDirectory: false,
          name: 'fileB2.php',
        },
        // Add more files or folders here as needed
      ]
    },
    // Add more files or folder''s here as needed
  ];

class HistoryStack{
    #items;
    constructor(){
        this.#items = []
    }
    push(item){
        this.#items.push(item)
    }
    pop(){
        return this.#items.pop()
    }
    peek(){
        return this.#items[this.#items.length - 1]
    }
    isEmpty(){
        return this.#items.length === 0
    }
    size(){
        return this.#items.length
    }
    print(){
        console.log(this.#items.join(', '))
    }
}   
let prePaths = new HistoryStack()
let forPaths = new HistoryStack()
let fileSystem = fileSystemTree;
let selected_item = {
    item:{},
    index:0
};
initFileManager('root/');
function initFileManager(path,config={keepHistory:true,callback:resetContextMenu}){
    document.querySelector('.folder-path-input').value = path;
    if(config.keepHistory)prePaths.push(path)
    let fileSys = JSON.parse(JSON.stringify(fileSystem));
    let pathArr = path.split('/')
    if((pathArr[0]!='root')) return newToast('error','404 | Path doesn\'t exist!',(close)=>setTimeout(()=>close(),5000))
    let flag = 0;
    for (let i = 1; i < pathArr.length; i++) {
        if(pathArr[i]){
            for (const folder in fileSys) {
                if(fileSys[folder].name == pathArr[i]){
                    fileSys = fileSys[folder].child;
                    flag++; 
                    break;
                }
            }
        }
    }
    if((pathArr.length-(pathArr[pathArr.length-1]?1:2)!=flag)) return newToast('error','404 | Path doesn\'t exist!',(close)=>setTimeout(()=>close(),5000))
    document.querySelector('.folderEmpty').style.display=(fileSys.length?'none':'block')
    setupFilemanager(fileSys)
    if(config.callback)config.callback();
}
function newItem(config={isDirectory:true,name:'unknown'}){
    let path= document.querySelector('.folder-path-input').value;
    if(!(path && config.name)) return newToast('error','Please fill out the name field!',(close)=>setTimeout(()=>close(),5000))
    let fileSys = fileSystem;
    let pathArr = path.split('/')
    for (let i = 1; i < pathArr.length; i++) {
        if(pathArr[i]){
            for (const folder in fileSys) {
                if(fileSys[folder].name == pathArr[i]){
                    fileSys = fileSys[folder].child;
                    break;
                }
            }
        }
    }
    if(config.isDirectory){
        fileSys.push({
            isDirectory: true,
            name: config.name,
            child: []
        })
    }else{
        fileSys.push({
            isDirectory: false,
            name: config.name,
        })
    }
    initFileManager(path,{keepHistory:false})
    newToast('success','Saved new '+(config.isDirectory?'folder':'file')+' "'+config.name+'"!',(close)=>setTimeout(()=>close(),5000))
}
function renameItem(newName){
    if(selected_item.item?.name){
        let path= document.querySelector('.folder-path-input').value;
        let pathArr = path.split('/')
        let fileSys = fileSystem;
        for (let i = 1; i < pathArr.length; i++) {
            if(pathArr[i]){
                for (const folder in fileSys) {
                    if(fileSys[folder].name == pathArr[i]){
                        fileSys = fileSys[folder].child;
                        break;
                    }
                }
            }
        }
        fileSys[selected_item.index].name=newName;
        newToast('success','Changed file name into '+selected_item.item.name+'!',(remove)=>{
            setTimeout(() => {
                remove()
            }, 6000);
        })
        initFileManager(path,{keepHistory:false})
    }
}
function deleteItem(){
    if(selected_item.item?.name){
        let path= document.querySelector('.folder-path-input').value;
        let pathArr = path.split('/')
        let fileSys = fileSystem;
        for (let i = 1; i < pathArr.length; i++) {
            if(pathArr[i]){
                for (const folder in fileSys) {
                    if(fileSys[folder].name == pathArr[i]){
                        fileSys = fileSys[folder].child;
                        break;
                    }
                }
            }
        }
        newToast('success',`Deleted ${selected_item.item.isDirectory?'folder':'file'} "${selected_item.item.name}"!`,(remove)=>{
            setTimeout(() => {
                remove()
            }, 6000);
        })
         fileSys.splice(selected_item.index,1);
        initFileManager(path,{keepHistory:false})
    }
}
function setupFilemanager(fileSystem){
    filesContainer = document.querySelector('.filemanager-container-row');
    filesContainer.innerHTML = ''
    resetHistoryBtn()
    for (const fileItem in fileSystem) {
        let div = document.createElement("div")
        div.setAttribute('title',fileSystem[fileItem].name)
        if(fileSystem[fileItem].isDirectory){
            div.classList.add('folder')
            div.addEventListener('dblclick',(e)=>{
                let toPath=document.querySelector('.folder-path-input').value+fileSystem[fileItem].name
                initFileManager(toPath+'/');
            })
            div.innerHTML += `
            <div class="folder-icon-container">
            <div class="folder-icon"></div>
            </div>
            <p class="folder-name">${fileSystem[fileItem].name}</p>
            `
        }else{
            // div.addEventListener('dblclick',(e)=>{})
            div.classList.add('file')
            let fileIcon = getFileIconMeta(fileSystem[fileItem])
            div.innerHTML += `
                    <div class="doc-icon-container">
                        <div class="doc-icon" style="--icon-color: ${fileIcon.color};"><p>${fileIcon.ext}</p></div>
                    </div>
                    <p class="file-name">${fileSystem[fileItem].name}</p>
            `
        }
        filesContainer.appendChild(div)
        div.addEventListener('click',(e)=>{
            // selected_item=document.querySelector('.folder-path-input').value+fileSystem[fileItem].name
            selected_item.index=fileItem;
            selected_item.item=fileSystem[fileItem];
            document.querySelector('.item-selected')?.classList.remove('item-selected')
            div.classList.add('item-selected')
        })
    }
}
function getFileIconMeta(file){
    let ext = file.name.split('.')[file.name.split('.').length-1];
    let color = '116, 116, 116'
    switch (ext) {
        case 'txt':
            color = '36, 230, 149'
            break;
    
        case 'html':
            color = '36, 230, 149'
            break;
    
        case 'php':
            color = '108, 74, 201'
            break;
    
        case 'zip':
            color = '190, 173, 16'
            break;
    
        case 'svg':
            color = '36, 230, 149'
            break;
        
        default:
            ext = '.?'            
            break;
    }
    return {ext:ext.toUpperCase(),color}
}

function backward(){
    if(!prePaths.isEmpty()){
        let currPath = prePaths.pop()
        forPaths.push(currPath)
        initFileManager(prePaths.peek(),{keepHistory:false})
    }
}
function forward(){
    if(!forPaths.isEmpty()){
        let currPath = forPaths.pop()
        prePaths.push(currPath)
        initFileManager(currPath,{keepHistory:false})
    }
}
function resetHistoryBtn(){
    if((prePaths.size()-1)==0){
        document.getElementById('backwardBtn').setAttribute('disabled',true)
    }else{
        document.getElementById('backwardBtn').removeAttribute('disabled')
    }
    if(forPaths.isEmpty()){
        document.getElementById('forwardBtn').setAttribute('disabled',true)
    }else{
        document.getElementById('forwardBtn').removeAttribute('disabled')
    }
}

function openModel(modelFor){ //'newFile' 
    document.querySelector('.popup').style.display='flex'
    document.querySelector('.popup >.popup-bg').addEventListener('click',()=>document.querySelector('.popup').style.display='none')
    if(modelFor=='newFile'){
        document.querySelector('.popup h1').innerHTML = 'New file'
        let input = document.createElement('input')
        input.setAttribute('type','text')
        input.setAttribute('placeholder','Filename')
        let saveButton = document.createElement('button')
        saveButton.style = 'background-color: rgb(1, 158, 111);';
        saveButton.innerHTML = 'Save';
        document.querySelector('.popup form').innerHTML = ''
        document.querySelector('.popup form').appendChild(input); 
        document.querySelector('.popup form').appendChild(saveButton); 
        saveButton.addEventListener('click',()=>{
            newItem(config={isDirectory:false,name:input.value});
            document.querySelector('.popup').style.display='none'
        })
    }
    if(modelFor=='newFolder'){
        document.querySelector('.popup h1').innerHTML = 'New Folder'
        let input = document.createElement('input')
        input.setAttribute('type','text')
        input.setAttribute('placeholder','Foldername')
        let saveButton = document.createElement('button')
        saveButton.style = 'background-color: rgb(1, 158, 111);';
        saveButton.innerHTML = 'Save';
        document.querySelector('.popup form').innerHTML = ''
        document.querySelector('.popup form').appendChild(input); 
        document.querySelector('.popup form').appendChild(saveButton); 
        saveButton.addEventListener('click',()=>{
            newItem(config={isDirectory:true,name:input.value});
            document.querySelector('.popup').style.display='none'
        })
    }
    if(modelFor=='rename'){
        if(selected_item.item?.name){

            document.querySelector('.popup h1').innerHTML = 'Rename'
            let input = document.createElement('input')
            input.setAttribute('type','text')
            input.setAttribute('placeholder',(selected_item.item.isDirectory?'Folder':'File')+' name ('+selected_item.item.name+')')
            input.value = selected_item.item.name;
            let saveButton = document.createElement('button')
            saveButton.style = 'background-color: rgb(1, 158, 111);';
            saveButton.innerHTML = 'Save';
            document.querySelector('.popup form').innerHTML = ''
            document.querySelector('.popup form').appendChild(input); 
            document.querySelector('.popup form').appendChild(saveButton); 
            saveButton.addEventListener('click',()=>{
                renameItem(input.value);
                document.querySelector('.popup').style.display='none'
            })
        }else{
            document.querySelector('.popup').style.display='none'
            newToast('error','Please select a File or Folder which you want to rename!',(remove)=>{
                setTimeout(() => {
                    remove()
                }, 6000);
            })
        }
    }
    if(modelFor=='delete'){
        if(selected_item.item?.name){

            document.querySelector('.popup h1').innerHTML = 'Sure to delete?'
            let saveButton = document.createElement('button')
            let cancelButton = document.createElement('button')
            saveButton.style = 'background-color: rgb(1, 158, 111);';
            saveButton.innerHTML = 'Yes';
            cancelButton.innerHTML = 'Cancel';
            document.querySelector('.popup form').innerHTML = ''
            // document.querySelector('.popup form').appendChild(input); 
            document.querySelector('.popup form').appendChild(saveButton); 
            document.querySelector('.popup form').appendChild(cancelButton); 
            saveButton.focus()
            saveButton.addEventListener('click',()=>{
                deleteItem();
                document.querySelector('.popup').style.display='none'
            })
            cancelButton.addEventListener('click',()=>{
                document.querySelector('.popup').style.display='none'
            })
        }else{
            document.querySelector('.popup').style.display='none'
            newToast('error','Please select a File or Folder which you want to delete!',(remove)=>{
                setTimeout(() => {
                    remove()
                }, 6000);
            })
        }
    }
}

function newToast(sts,message,cb){
    sts = (sts=='success'?'toast-sccess':(sts=='error'?'toast-dnger':'toast-inf'));
    let tContainer = document.querySelector('.toast-messages')
    let c = document.createElement('div')
    let bc = document.createElement('div')
    let p = document.createElement('p')
    let b = document.createElement('button')
    c.classList.add('toast-container',sts)
    // c.setAttribute('id','sjdfnksjdfn');
    p.innerText = message;
    b.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    b.addEventListener('click',removeToast);
    c.appendChild(p)
    bc.appendChild(b)
    c.appendChild(bc)
    tContainer.prepend(c)
    setTimeout(() => {
        c.style.opacity = '1'
    }, 300);
    function removeToast(){
        c.style = `
            opacity:0;
        `
        setTimeout(() => {
            c.remove()
        }, 500);
    }
    if(cb)cb(removeToast);
}

newToast('info','Welcome: in testing mode...',(remove)=>{
    setTimeout(() => {
        remove()
    }, 10000);
})
window.addEventListener('focus',()=>{
    
    newToast('info','Welcome back!',(remove)=>{
        setTimeout(() => {
            remove()
        }, 3000);
    })
})
window.addEventListener('blur',(e)=>{
    newToast('info','Seems you gone!',(remove)=>{
        e.target.addEventListener('focus',()=>{
            setTimeout(() => {
                remove()
            }, 1200);
        })
    })
})
