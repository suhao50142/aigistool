import { app, BrowserWindow,ipcMain as ipc } from 'electron'
import fs from 'fs'
import path from 'path'
import {getMainClass, getClassDetail} from './getClasses';
import {getMainPage, getAllData, getCharacterData, combineAlias} from './getData';
import Store from 'electron-store';
const store = new Store({name:'setting'});

if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(path.resolve(__dirname,'../../../../'),'/data').replace(/\\/g, '\\\\');
  if (!fs.existsSync(global.__static)) fs.mkdirSync(global.__static);
}

const MainFile=[path.join(__static,'close.json'),path.join(__static,'distant.json'),path.join(__static,'basic.json'),path.join(__static,'characters.json')]
const ClassFile=[path.join(__static,'basicClass.json'),path.join(__static,'class.json')]

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  mainWindow = new BrowserWindow({
    height: 578,
    useContentSize: true,
    width: 1000,
    frame: false,
    transparent: true
  })
  mainWindow.setResizable(false)
  mainWindow.setFullScreenable(false)
  mainWindow.setMaximizable(false)
  mainWindow.loadURL(winURL)
  mainWindow.on('closed', () => {
    if (win!==null) win.close();
    mainWindow = null;
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipc.on('close',()=>{
  if (mainWindow !== null) {
    mainWindow.close();
  }
})

ipc.on('getMainPage',(event,force)=>{
  if (fs.existsSync(MainFile[3])&&!force){
    event.sender.send('MainPage',null);
  }else{
    let p1=getMainPage('http://seesaawiki.jp/aigis/d/class_%b6%e1%c0%dc%b7%bf_index'),
    p2=getMainPage('http://seesaawiki.jp/aigis/d/class_%b1%f3%b5%f7%ce%a5%b7%bf_index');
    Promise.all([p1,p2]).then((fstore)=>{
      for (let i=0;i<2;i++)
        fs.writeFileSync(MainFile[i],JSON.stringify(fstore[i]).replace(/(?!^){/g,'\n\t{').replace(/],"/g,'],\n"'));
      getAllData(MainFile);
      event.sender.send('ret','1/4开始获取获取角色信息');
      if (fs.existsSync(MainFile[2])){
        let data=JSON.parse(fs.readFileSync(MainFile[2]));
        getCharacterFile(data,event);
        fs.unlinkSync(MainFile[0]);
        fs.unlinkSync(MainFile[1]);
        fs.unlinkSync(MainFile[2]);
      }
    }).catch(()=>{
      event.sender.send('MainPage',false);
    })
  }
})

function getCharacterFile(data,event){
  let json={};
  let processlist=[];
  let trytimes=1;
  if (store.has('thread')) trytimes=store.get('thread');
  for (let name in data){
    if (name=='王子（ユニットページへ）') continue
    processlist.push(getCharacterData(data[name],name,event,trytimes));
  }
  event.sender.send('ret','1/4开始获取角色信息 0/'+processlist.length);
  Promise.all(processlist).then((datalist)=>{
    let json=datalist.reduce((pre,cur)=>{
      return Object.assign(pre,cur);
    });
    fs.writeFileSync(MainFile[3],JSON.stringify(json).replace(/(?!^){/g,'\n\t{').replace(/},"/g,'},\n"'));
    combineAlias();
    event.sender.send('ret','2/4开始获取职业列表');
    getClassMain(event);
    event.sender.send('MainPage',true);
  }).catch(()=>{
    event.sender.send('MainPage',false);
  });
}

let win=null;

ipc.on('settingPage', (e)=>{
  if (win!==null) return;
  const modalPath = process.env.NODE_ENV === 'development'
      ? 'http://localhost:9080/#/settingPage'
      : `file://${__dirname}/index.html#settingPage`
  win = new BrowserWindow({
      width: 400,
      height: 400,
      frame: false,
      transparent: true
  })
  win.setResizable(false)
  win.setFullScreenable(false)
  win.setMaximizable(false)
  win.loadURL(modalPath)
  win.on('close', ()=> {
      win = null;
  })
  ipc.on('getMainID',(event)=>{
      event.sender.send('MainID',mainWindow.id);
  });
});

ipc.on('closeSetting',()=>{
  win.close();
});

function getClassMain(event){
  let p1=getMainClass('http://seesaawiki.jp/aigis/d/class_%b6%e1%c0%dc%b7%bf_%cc%dc%bc%a1'),
  p2=getMainClass('http://seesaawiki.jp/aigis/d/class_%b1%f3%b5%f7%ce%a5%b7%bf_%cc%dc%bc%a1');
  Promise.all([p1,p2]).then((json)=>{
    fs.writeFileSync(ClassFile[0],JSON.stringify(Object.assign(json[0],json[1])).replace(/,"/g,',\n"'));
    let data=JSON.parse(fs.readFileSync(ClassFile[0]));
    getClassFile(data,event);
    fs.unlinkSync(ClassFile[0]);
  }).catch(()=>{
    event.sender.send('MainClass',false);
  })
}

function getClassFile(data,event){
  let json={};
  let processlist=[];
  let trytimes=1;
  if (store.has('thread')) trytimes=store.get('thread');
  for (let name in data){
    processlist.push(getClassDetail(data[name],name,event,trytimes));
  }
  event.sender.send('ret','3/4开始获取职业信息 0/'+processlist.length);
  Promise.all(processlist).then((datalist)=>{
    let json=datalist.reduce((pre,cur)=>{
      return Object.assign(pre,cur);
    });
    fs.writeFileSync(ClassFile[1],JSON.stringify(json).replace(/,"/g,',\n"'));
    event.sender.send('MainClass',true);
  }).catch(()=>{
    event.sender.send('MainClass',false);
  });
}