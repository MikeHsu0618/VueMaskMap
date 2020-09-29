var app = new Vue({
    el: '#app',
    data: {
        map: null,
        Arrfilter:[],
        ArrPosition:[],
        filterText: '新北市蘆洲區',
    },
    methods: {
        getData() {
            const vm =this;
            console.log(vm.filterText)
            var xhr = new XMLHttpRequest();
            xhr.open("GET","https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json");
            xhr.send();
            xhr.onload = function () {
                dataArray = JSON.parse(xhr.responseText);
                vm.Arrfilter=[...dataArray.features];
                vm.Arrfilter= vm.Arrfilter.filter(function(item){
                    return item.properties.address.match(vm.filterText) || item.properties.name.match(vm.filterText)
                })
                vm.ArrPosition = [];
                vm.Arrfilter.forEach(function(item) {
                    let obj = {
                        x: item.geometry.coordinates[0],
                        y: item.geometry.coordinates[1]
                    }
                    vm.ArrPosition.push(obj);
                })
                console.log(vm.ArrPosition);
            }
        },
        setMap(){
            var vm = this;
            //設定一個地圖，把這地圖定位在#map，先訂位 CENTER座標，ZOOM定位16
        this.map = L.map('map', {
            center: [25.086112,121.479595],
            zoom: 16
        });
        console.log(this.map)   
        
                    //要載入的圖資來源
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
        
        
        
           //設定ICON樣式
        var greenIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });
          var redIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });
        
        
        
        // // 加上一個MARKER並設定他的座標同時將這個座標放入對應的地圖裡
        // L.marker([22.604964, 120.300476], {icon: greenIcon}).addTo(map)
        // //     我要針對這個marker，加上HTML內容進去
        //      .bindPopup('<h1>高雄軟體園區</h1>')
        // //     我預設要把它開啟
        //      .openPopup();
        
        
        //新增圖層，這圖層專門放ICON群組
        var markers = new L.MarkerClusterGroup().addTo(this.map);
        
        //整合  圖資框架(呈現)+第三方OPEN DATA JSON(資料)
        var xhr = new XMLHttpRequest();
        xhr.open('GET',"https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json");
        xhr.send();
        xhr.onload = function(){
            var MapData = JSON.parse(xhr.responseText).features; 
            var maskIcon;
            for(let i =0;MapData.length>i;i++){
                if(MapData[i].properties.mask_adult == 0){
                    maskIcon = redIcon;
                }else{
                    maskIcon = greenIcon;
                }
               
                
                //在該圖層上面放上群組
                markers.addLayer(L.marker([MapData[i].geometry.coordinates[1] ,MapData[i].geometry.coordinates[0]], {icon: maskIcon}).bindPopup(
                    `
                    <ul class="list">
                    <li>
                        <h2>${MapData[i].properties.name} </h2>
                        <p>${MapData[i].properties.address}</p>
                        <p>${MapData[i].properties.phone}</p>
                        <P>口罩販賣時段：${MapData[i].properties.note?MapData[i].properties.note:'暫無資料'}</P>
                        <div class="masknum">
                            <div class="adult_masknum">成人口罩 ${MapData[i].properties.mask_adult}</div>
                            <div class="child_masknum">兒童口罩 ${MapData[i].properties.mask_child}</div>
                        </div>
                    </li>
                </ul>
                 `));
              // add more markers here...
                // L.marker().addTo(map)
                //   )
              }
              vm.map.addLayer(markers);
        }
        },
        judgeOddEven(_day) {
            //判斷奇數偶數
            if (_day == 1 || _day == 3 || _day == 5 ){
                document.querySelector('.odd').style.display = 'block';
            }else if (_day == 2 || _day == 4 || _day == 6 ){
                document.querySelector('.even').style.display = 'block';
            }else if (_day == 0){
                document.querySelector('.all').style.display = 'block';
            }
            
        },
        judgeDayChinese(day){
            //判斷禮拜幾
            if(day == 4){
                return "四"
            }else if(day == 1){
                return "一"
            }else if(day == 2){
                return "二"
            }else if(day == 3){
                return "三"
            }else if(day == 5){
                return "五"
            }else if(day == 6){
                return "六"
            }else if(day == 0){
                return "日"
            }
        },
        renderDay(){
            //判斷奇數偶數天
            var _date = new Date();
            var _day = _date.getDay();
            var _chineseDay = this.judgeDayChinese(_day);
            var year = _date.getFullYear();
            var month = ("0" + (_date.getMonth() + 1)).slice(-2);
            var day = ("0" + _date.getDate() ).slice(-2);
            var _thisDay = year + '-' + month + '-' + day;
            document.querySelector('h3').textContent = _thisDay;
            document.querySelector('h2 span').textContent =_chineseDay ;
            //判斷奇數偶數
            var OddEven = this.judgeOddEven (_day);
            
        },
        setPosition(item,key) {
            console.log(this.ArrPosition)
            var x = this.ArrPosition[key].x;
            var y = this.ArrPosition[key].y;
            console.log(item)
            this.map.setView([y, x], 16);
            L.popup().setLatLng([y, x]).setContent(
                `
                <ul class="list">
                <li @click="setPosition(item,key)">
                    <h2>${item.properties.name} </h2>
                    <p>${item.properties.address}</p>
                    <p>${item.properties.phone}</p>
                    <P>口罩販賣時段：${item.properties.note?item.properties.note:'暫無資料'}</P>
                    <div class="masknum">
                        <div class="adult_masknum">成人口罩 ${item.properties.mask_adult}</div>
                        <div class="child_masknum">兒童口罩 ${item.properties.mask_child}</div>
                    </div>
                </li>
            </ul>
             ` ).openOn(this.map)
        }
        

            
    },
    mounted(){
            this.getData();
            this.setMap();
            this.renderDay();
    },
})