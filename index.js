var colors = require('colors');

// black, red, green, yellow, blue, magenta, cyan, white, gray, grey, brightRed, brightGreen, brightYellow, brightBlue, brightMagenta, brightCyan, brightWhite, reset, bold, dim, italic, underline, inverse, hidden, strikethrough

/*
const player = require('node-wav-player');
function splay(fname) {
	player.play({
		path: `./sounds/${fname}`,
	}).then(() => {
		//
	}).catch((error) => {
		throw error;
	});
}
//*/

function arraysEqual(a, b) {
  a = Array.isArray(a) ? a : [];
  b = Array.isArray(b) ? b : [];
  return a.length === b.length && a.every((el, ix) => el === b[ix]);
}

const deasync = require('deasync');
const sleep = ms => deasync.sleep(ms);

//var readline = require('readline');
//readline.emitKeypressEvents(process.stdin);
var keypress = require('keypress');
keypress(process.stdin);
process.stdin.setRawMode(true);

var db = require('just-debounce');



var pxy = [0,0];
var ppxy = pxy;
var currentRoom = ``;
var floor = 1;
var Map = [];
var Minimap = ``;
var mapw = 0;
var maph = 0;

var plrs = [`►`,`◄`,`▼`,`▲`];

var plr = `◄`.blue;
var enemy = `►`.red;
var button = `▓`.brightGreen;
var buttonpressed = [`▓`.red];

var wallchar = "█";
var wallchars = {
    //"rldu": "O"
    "1100": "━",
    "0011": "┃",
    "1010": "┏",
    "0110": "┓",
    "1001": "┗",
    "0101": "┛",
    "1011": "┣",
    "0111": "┫",
    "1110": "┳",
    "1101": "┻",
    "1111": "╋",
    "0100": "╸",
    "0001": "╹",
    "1000": "╺",
    "0010": "╻"
};

roomwidth = 17;
roomheight = 17;

var rooms = [`
    █       █    
    █       █    
    █       █    
    █       █    
█████       █████
                 
                 
       ███       
       █ █       
       ███       
                 
                 
█████       █████
    █       █    
    █       █    
    █       █    
    █       █    `,
`
                 
                 
                 
                 
  ██████████████ 
  █        █   █ 
  █    █████   █ 
  ███   █      █ 
    █      █████ 
    ███      █   
      █      ██  
     █████    ██ 
 █████   █     █ 
 █      ██   ███ 
 █           █   
 ████       ██   
    █       █    `,
`
                 
                 
                 
                 
           ██████
           █     
    ████████     
    █            
    █            
  ███     ████   
  █       █      
  ███     ███  █ 
    █       █████
    █      ██    
    █       █    
    ███     █    
    █       █    `,
`
    █       █    
    █       █    
 ████       █    
 █         ███   
 ██          █   
  ██████     ██  
  █   █       █  
 ██  ██████   █  
 █   █  █     █  
 █   ████    ██  
 █      █     █  
 ██    ██     █  
  █         ███  
  █       ███    
  ███       █    
    █       █    
    █       █    `,
`
    █       █    
    █       █    
    █       ███  
    █         █  
   ████     █████
   █        █    
  ██      ████   
  █          █   
 ████            
 █      ███      
 █      █        
 █  █   ███      
 █  █        ████
 ████     ████   
    █       █    
    █       █    
    █       █    `,
`
    █       █    
    █       █    
   ██       █    
  ██     ██████  
███           ███
                 
       █████     
   █████   ██    
                 
   ██            
    ████  ███    
       ████      
████          ███
   ██      ████  
    █       █    
    ██      █    
    █       █    `,
`
    █       █    
    █       █    
    █       █    
    ██      ███  
   ██   ███   ███
  ██    █ █      
  █     ███      
  █              
  █     █    █   
  ███   ██████   
  █ █       █    
  █         █    
  ██     ████████
   █    ██    █  
   ██       ███  
    █       █    
    █       █    `,
`
                 
     ████████    
    ██      ███  
   ██         █  
   █    ██    █  
  ██   ██     █  
  █    █    ███  
 ██    █    █ ██ 
 █     █       █ 
 █     ███    ██ 
 █       ██    █ 
 ██      █     █ 
  █  █████   ███ 
  ████         █ 
    █          █ 
    █       ████ 
    █       █    `

];


for(let i=0;i<rooms.length;i++) {
    rooms[i] = rooms[i].substring(1);
}

var roomdata = [//r,l,d,u
//0//////////////////////
[[true,true,true,true],[[9,6],[9,12],[6,9],[12,9],[6,6],[6,12],[12,6],[12,12],[9,1],[1,9],[9,17],[17,9]],[]],
//1//////////////////////
[[false,false,true,false],[],[[10,5],[16,7],[5,13],[14,15]]],
//2//////////////////////
[[true,false,true,false],[],[[8,7],[14,13],[5,15]]],
//3//////////////////////
[[false,false,true,true],[],[[15,8],[6,9],[14,13]]],
//4//////////////////////
[[true,false,true,true],[],[[12,7],[2,11],[13,15]]],
//5//////////////////////
[[true,true,true,true],[],[[10,7],[14,14],[5,15]]],
//6//////////////////////
[[true,false,true,true],[],[[9,7],[10,11],[14,13]]],
//7//////////////////////
[[false,false,true,false],[],[[15,5],[9,10],[4,14]]]
//end////////////////////
];

var endroomu = 
`    █████████    `;
var endroomv = `
 
 
 
 
█
█
█
█
█
█
█
█
█
 
 
 
 `.substring(1);

String.prototype.walloff = function(directions) {
    let output = (' '+this).slice(1);
    let wide = this.indexOf(`
`);
    let high = Math.floor(this.length/(wide+1))+1;
    if(directions[0]) {
        let splitted = endroomv.split(`
`);
        for(let i=0;i<splitted.length;i++) {
            output = output.substring(0,((wide+1)*(i+1))-3)+splitted[i]+' '+output.substring(((wide+1)*(i+1))-1);
        }
    }
    if(directions[1]) {
        let splitted = endroomv.split(`
`);
        for(let i=0;i<splitted.length;i++) {
            output = output.substring(0,((wide+1)*i))+' '+splitted[i]+output.substring(((wide+1)*i)+2);
        }
    }
    if(directions[2]) {
        output = output.substring(0,(wide+1)*(high-2))+endroomu+`
`+`                 `;
    }
    if(directions[3]) {
        output =
            `                 `+`
`+endroomu+`
`+output.substring((wide+1)*2);
    }
    return output;
}

var endroomdata = [[false,false,false,true],[],[]];

function rc(xyc) {
    return [roomwidth+1-xyc[1],xyc[0]];
}

function iXY(i) {
    return [i%(roomwidth+1)+1,1+(i-(i%(roomwidth+1)))/(roomwidth+1)];
}

String.prototype.advXYi = function(xy) {
    let rows = this.split(`
`);
    let i=0;
    let xo = xy[0]-1;
    let p = plr;
    let e = enemy;
    let b = button;
    let bp = buttonpressed;
    while(i<xo) {
        let x = rows[xy[1]-1];
        let search = (x.indexOf(p,i)!=-1)&&(x.indexOf(p,i))||((x.indexOf(e,i)!=-1)&&(x.indexOf(e,i))||((x.indexOf(b,i)!=-1)&&(x.indexOf(b,i))||x.indexOf(bp,i)));
        if(search!=-1) {
            i=search+1;
            xo+=11;
        } else {
            i=xo+1;
        }
    }
    let index = 0;
    for(let j=0;j<xy[1]-1;j++){
        index += rows[j].length+1;
    }
    index += xo;
    return index;
}

function XYi(xy) {
    return xy[0]-1+(xy[1]-1)*(roomwidth+1);
}

String.prototype.rotater = function(rot,rn) {
    let room = [...this];
    let copy = [...(` `.repeat(room.length))];
    for(let i=0;i<room.length;i++) {
        if(room[i]!= '\n') {
            let x = 1+(i%(roomwidth+1));
            let y = 1+((i-(i%(roomwidth+1)))/(roomwidth+1));
            let outputc = [x,y];
            for(let j=0;j<rot;j++) {
                outputc = rc(outputc);
            }
            copy[XYi(outputc)] = room[i];
        } else {
            copy[i] = room[i];
        }
    }
    copy = copy.join(``);
    let copydataa = roomdata[rn][0];
    let copydatab = roomdata[rn][1];
    let copydatad = roomdata[rn][2];
    let copydata = [[],[],[]];
    if(rot==0){
        copydata = roomdata[rn];
    }
    for(let i=0;i<rot;i++) {
        let copydatac = [...copydataa];
        copydata[0][0] = copydatac[3];
        copydata[0][1] = copydatac[2];
        copydata[0][2] = copydatac[0];
        copydata[0][3] = copydatac[1];
        copydata[1] = [];
        copydata[2] = [];
        for(const v of copydatab) {
            copydata[1].push(rc(v));
        }
        for(const v of copydatad) {
            copydata[2].push(rc(v));
        }
        copydataa = [...copydata[0]];
        copydatab = [...copydata[1]];
        copydatad = [...copydata[2]];
    }
    return [copy,copydata];
}

function wallroom(room) {
    let walledroom = ``;
    let roomarray = [...room];
    let w = room.indexOf(`
`);
    let h = Math.ceil(room.length/(w+1));
    for(let i=0;i<room.length;i++) {
        if(roomarray[i] == "█") {
            let xy = [i%(w+1)+1,1+(i-(i%(w+1)))/(w+1)];
            
            let s = [(xy[0]<w)&&(roomarray[xy[0]+(xy[1]-1)*(w+1)]=="█")||(xy[0]==w),(xy[0]>1)&&(roomarray[xy[0]-2+(xy[1]-1)*(w+1)]=="█")||(xy[0]==1),(xy[1]<h)&&(roomarray[xy[0]-1+(xy[1])*(w+1)]=="█")||(xy[1]==h),(xy[1]>1)&&(roomarray[xy[0]-1+(xy[1]-2)*(w+1)]=="█")||(xy[1]==1)]; //right,left,down,up
            let wallcode = (s[0]&&"1"||"0")+(s[1]&&"1"||"0")+(s[2]&&"1"||"0")+(s[3]&&"1"||"0");
            walledroom += wallchars[wallcode];
        } else {
            walledroom += roomarray[i];
        }
    }
    return walledroom;
}

var objectsInRoom = 0;

String.prototype.count = function(str) {
   return this.split(str).length - 1;
}
function getBox(xy,rd) {
    let shiftx = 1;
    let shifty = 1;
    let xa = xy[0]-rd;
    if(xa<1) {
        shiftx = xy[0]-rd;
        xa = 1;
    }
    let ya = xy[1]-rd;
    if(ya<1) {
        shifty = xy[1]-rd;
        ya = 1;
    }
    let xb = xy[0]+rd;
    if(xb>mapw) {
        shiftx = xy[0]+rd-mapw;
        xb = mapw;
    }
    let yb = xy[1]+rd;
    if(yb>maph) {
        shifty = xy[1]+rd-maph;
        yb = maph;
    }
    return [[xa,ya],[xb,yb],[shiftx,shifty]];
}

var box = getBox(pxy,16);

String.prototype.addObject = function(obj,pos) {
    box = getBox(pxy,16);
    let m = this.renderBox(box[0],box[1],box[2])
    let index = m.advXYi(pos);
    if(m.charAt(index)!=` `) {
        box = getBox(ppxy,16);
        pxy = [...ppxy];
    }
    m = this.renderBox(box[0],box[1],box[2])
    index = m.advXYi(pos);
    return m.substring(0,index)+obj+m.substring(index+1,m.length);
};

var started = false;

function render() {
    if(!started){started = true};
    console.clear();
    //genbuttons();
    console.log(currentRoom.addObject(plr,pxy));
}

String.prototype.mapXYi = function(xy) {
    let breaker = `
`;
    let w = this.indexOf(breaker)-1;
    return xy[0]-1+(xy[1]-1)*(w+1);
}

function generateFloor(fn) {
    console.clear();
    let roomCount = 10+Math.floor(Math.random()*7)+fn*Math.floor((Math.random()*3)+1);
    let buttonCount = Math.floor(fn/4)+1;
    Map = [];
    Map.push([[0,0],rooms[0],roomdata[0][0]]);
    let Data = [[0,0],roomdata[0][0]];
    let Placements = [];
    for(let j=0;j<Data[1].length;j++) {
        if(Data[1][j]) {
            let d = Data[0];
            if(j == 0) {
                Placements.push([[d[0]+1,d[1]],j]);
            } else if(j == 1) {
                Placements.push([[d[0]-1,d[1]],j]);
            } else if(j == 2) {
                Placements.push([[d[0],d[1]+1],j]);
            } else if(j == 3) {
                Placements.push([[d[0],d[1]-1],j]);
            }
        }
    }
    let validrooms = [...rooms].slice(1);
    for(let i=0;i<roomCount;i++) {
        let rtries = 0;
        let ptries = 0;
        let success = false;
        while(!success&&ptries<20) {
            ptries++;
            let randomPlacement = Math.floor(Math.random()*Placements.length);
            while(!success&&rtries<20) {
                let randomNum = Math.floor(Math.random()*validrooms.length);
                let randomRoom = validrooms[randomNum].rotater(Math.floor(Math.random()*4),randomNum+1);
                let randRoom = randomRoom[0];
                let t = Placements[randomPlacement][1];
                let tb = (t==3)&&2||((t==2)&&3||((t==1)&&0||((t==0)&&1||-1)))
                if(randomRoom[1][0][tb]) {
                    Map.push([Placements[randomPlacement][0],randRoom,randomRoom[1][0]]);
                    Data = [Placements[randomPlacement][0],randomRoom[1][0]];
                    let placementxy = Placements[randomPlacement][0];
                    for(let j=0;j<Data[1].length;j++) {
                        let p = [[placementxy[0]+1,placementxy[1]],[placementxy[0]-1,placementxy[1]],[placementxy[0],placementxy[1]+1],[placementxy[0],placementxy[1]-1]];
                        if(Data[1][j] && Map.findIndex((e) => arraysEqual(e[0],p[j])) == -1) {
                            let d = Data[0];
                            if(j == 0) {
                                Placements.push([[d[0]+1,d[1]],j]);
                            } else if(j == 1) {
                                Placements.push([[d[0]-1,d[1]],j]);
                            } else if(j == 2) {
                                Placements.push([[d[0],d[1]+1],j]);
                            } else if(j == 3) {
                                Placements.push([[d[0],d[1]-1],j]);
                            }
                        }
                    }
                    Placements.splice(randomPlacement,1);
                    success = true;
                } else {
                    rtries++;
                }
            }
            if(success) {
                break;
            }
        }
    }
    for(let i=0;i<Map.length;i++) {
        let v = Map[i];
        let towall = [false,false,false,false];
        for(let j=0;j<4;j++) {
            let coords = [v[0][0]+((Math.floor((j/2))+1)%2)*Math.pow(-1,j),v[0][1]+(Math.floor((j/2))%2)*Math.pow(-1,j)];
            //console.log(coords);
            let mfind = Map.findIndex((e) => arraysEqual(e[0],coords));
            if(v[2][j]) {
                if(mfind==-1) {
                    //console.log([j,[false,false,false,false]]);
                    towall[j] = true;
                } else {
                    //console.log([j,mfind[2]]);
                    towall[j] = !Map[mfind][2][j+(((j%2)==0)&&1||-1)];
                }
            } else {
                if(mfind===undefined) {
                    //console.log([j,[false,false,false,false]]);
                } else {
                    //console.log([j,mfind[2]]);
                }
            }
        }
        //console.log(towall);
        //console.log([v[1]]);
        let vcopy = v[1].walloff(towall);
        v[1] = vcopy.replace("��","█");
        //console.log([v[1]]);
    }
    let maxxy = [-Infinity,-Infinity];
    let minxy = [Infinity,Infinity];
    for(const v of Map) {
        if(v[0][0]<minxy[0]) {
            minxy[0] = v[0][0];
        }
        if(v[0][0]>maxxy[0]) {
            maxxy[0] = v[0][0];
        }
        if(v[0][1]<minxy[1]) {
            minxy[1] = v[0][1];
        }
        if(v[0][1]>maxxy[1]) {
            maxxy[1] = v[0][1];
        }
    }
    let breaker = '\n';
    let Maplines = [];
    for(let i=0;i<(maxxy[1]-minxy[1]+1)*roomheight;i++) {
        let mapline = ' '.repeat((maxxy[0]-minxy[0]+1)*roomwidth)+`
`;
        Maplines.push(mapline);
    }
    let Mapstring = Maplines.join('');
    
    Mapstring = Mapstring.substring(0,Mapstring.length-2);
    for(const v of Map) {
        let roomXY = [v[0][0]-minxy[0]+1,v[0][1]-minxy[1]+1];
        let roomString = v[1];
        let w = roomString.indexOf(`
`);
        let h = Math.floor(roomString.length/(w+1))+1;
        let indexes = [];
        let ind = roomString.indexOf(`
`,indexes.length);
        indexes.push(0);
        while(ind != -1) {
            indexes.push(ind);
            ind = roomString.indexOf(`
`,indexes.length+1);
        }
        indexes.push(roomString.length);
        let roomlines = [];
        for(let i=0;i<indexes.length-2;i++) {
            roomlines.push(roomString.substring(indexes[i],indexes[i+1]));
        }
        for(let i=0;i<h;i++) {
            let startXY = [(roomXY[0]-1)*w+1,(roomXY[1]-1)*h+i+1];
            let endXY = [roomXY[0]*w,(roomXY[1]-1)*h+i+1];
            let mw = Mapstring.indexOf(`
`);
            let startI = startXY[0]-1+(startXY[1]-1)*(mw+1);
            let endI = endXY[0]-1+(endXY[1]-1)*(mw+1);
            Mapstring = Mapstring.substring(0,startI)+roomString.substring((w+1)*i,(w+1)*(i+1)-1)+Mapstring.substring(endI+1);
        }
    }
    Mapstring = Mapstring.replace("��","█");
    mapw = Mapstring.indexOf(`
`);
    maph = Math.ceil(Mapstring.length/(mapw+1));
    let spawn = roomdata[0][1][Math.floor(Math.random()*7)]
    pxy = [spawn[0]-minxy[0]*17,spawn[1]-minxy[1]*17];
    
    return wallroom(Mapstring);
    //return Mapstring;
}
var currentMap = generateFloor(1);

String.prototype.renderBox = function(xya,xyb,shift) {
    let breaker = `
`;
    let parts = [];
    let firstI = xya[0]-1+(xya[1]-1)*(mapw+1);
    let secondI = xyb[0]-1+(xya[1]-1)*(mapw+1);
    for(let i=0;i<xyb[1]-xya[1]+1;i++) {
        firstI = xya[0]-1+(xya[1]-1+i)*(mapw+1);
        secondI = xyb[0]-1+(xya[1]-1+i)*(mapw+1);
        parts.push(this.substring(firstI,secondI+1));
    }
    let line = ` `.repeat(secondI-firstI+1);
    for(let i=0;i<Math.abs(shift[1])+1;i++) {
        if(shift[1]>1) {
            parts.push(line);
        } else if(shift[1]<1) {
            parts.unshift(line);
        }
    }
    let dots = ` `.repeat(Math.abs(shift[0])+1);
    for(let i=0;i<parts.length;i++) {
        if(shift[0]>1) {
            parts[i] = `${parts[i]}${dots}`;
        } else if(shift[0]<1) {
            parts[i] = `${dots}${parts[i]}`;
        }
    }
    return parts.join(breaker);
}

var rend = currentMap.renderBox(box[0],box[1],box[2])

/*
rl.on('line', (input) => {
	if(input==="start" || input==="ssttaarrtt") {
        currentRoom = wallroom(rooms[0]);
        box = getBox(pxy,8);
        rend = currentMap.renderBox(box[0],box[1],box[2])
        console.log(rend);
	}
});
*/

function up() {
    ppxy = [...pxy];
    pxy[1] += (pxy[1]>1)&&-1||0;
    console.clear();
    box = getBox(pxy,16);
    rend = currentMap.addObject(plr,[17,17]);
    console.log(rend);
}

function right() {
    ppxy = [...pxy];
    pxy[0] += (pxy[0]<mapw)&&1||0;
    console.clear();
    box = getBox(pxy,16); 
    rend = currentMap.addObject(plr,[17,17]);
    console.log(rend);
}

function down() {
    ppxy = [...pxy];
    pxy[1] += (pxy[1]<maph)&&1||0;
    console.clear();
    box = getBox(pxy,16); 
    rend = currentMap.addObject(plr,[17,17]);
    console.log(rend);
}

function left() {
    ppxy = [...pxy];
    pxy[0] += (pxy[0]>1)&&-1||0;
    console.clear();
    box = getBox(pxy,16); 
    rend = currentMap.addObject(plr,[17,17]);
    console.log(rend);
}

const GetKeyState = require("getkeystate");

process.stdin.on('keypress', db(function (ch, k) {
    if(!(GetKeyState(0x57)||GetKeyState(0x41)||GetKeyState(0x53)||GetKeyState(0x44)||GetKeyState(0x25)||GetKeyState(0x26)||GetKeyState(0x27)||GetKeyState(0x28))) {
        return;
    }
    let key = k.name;
    //if(!started){return};
    if((key == 'up' || key == 'w')) {
        plr = plrs[3].blue;
        db(up(),250,true);
    }
    if((key == 'right' || key == 'd')) {
        plr = plrs[0].blue;
        db(right(),250,true);
    }
    if((key == 'down' || key == 's')) {
        plr = plrs[2].blue;
        db(down(),250,true);
    }
    if((key == 'left' || key == 'a')) {
        plr = plrs[1].blue;
        db(left(),250,true);
    }
},200,true));


console.log(`Terminal Decendance v0.6 INFDEV

welcome! type "start" in the console to start.`);

process.stdin.on('keypress', (charater, key) => {
  console.log(charater)
  console.log(key)
})