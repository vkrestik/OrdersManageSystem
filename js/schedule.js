import {state} from "./state.js";
import { createBlock,dropElement } from "./block.js";
function createTopperRow(){
    let dateReg=document.createElement("div");
    dateReg.className="week";
    dateReg.style.alignItems="center";
   
    let EndOfWeek=new Date(StartOfWeek.getTime());
    EndOfWeek.setDate(EndOfWeek.getDate()+6);

    let buttonPrevious=document.createElement("button");
		buttonPrevious.className="buttonDefolt";
    buttonPrevious.textContent="<";
    dateReg.appendChild(buttonPrevious);

    buttonPrevious.addEventListener("click", async function(e){
      //let startOfPreviousWeek=new Date(StartOfWeek.getTime());
      StartOfWeek.setDate(StartOfWeek.getDate() - 7);

      let newdateReg=createTopperRow();
      dateReg.replaceWith(newdateReg);

      let newGrid=await renderGrid();
      let oldGrid = document.querySelector(".grid");
      oldGrid.replaceWith(newGrid);
    });

    let week=document.createElement("span");
    week.innerHTML=`${StartOfWeek.toLocaleDateString()}-${EndOfWeek.toLocaleDateString()}`;
    dateReg.appendChild(week);

    let buttonNext=document.createElement("button");
		buttonNext.className="buttonDefolt";
    buttonNext.innerHTML=">";
    dateReg.appendChild(buttonNext);

    buttonNext.addEventListener("click", async function(e){
      StartOfWeek.setDate(StartOfWeek.getDate() + 7);

      let newdateReg=createTopperRow();
      dateReg.replaceWith(newdateReg);

      let newGrid=await renderGrid();
      let oldGrid = document.querySelector(".grid");
      oldGrid.replaceWith(newGrid);
    });
    return dateReg;
}

function createScale(){  //шкала часов
    let hoursContainer=document.createElement("div");
    hoursContainer.className="hoursContainer";
    for (let hour of hours){
      let cell = document.createElement("div");
      cell.className = "hourScale";
      cell.textContent=hour+":00";
      hoursContainer.appendChild(cell);
    }
    return hoursContainer;
}
function createButton(){
    const containerScedule = document.querySelector(".scedule");
    let buttonNextDay=document.createElement("button");
		buttonNextDay.className="buttonDefolt";
    buttonNextDay.textContent="↓";
    buttonNextDay.addEventListener("click", async function(e){
	    let Container=document.querySelector(".grid");
      StartOfWeek.setDate(StartOfWeek.getDate()+1);
      let newEndOfWeek=new Date(StartOfWeek.getTime());
      newEndOfWeek.setDate(StartOfWeek.getDate()+6);

      let dateReg=document.querySelector(".week");
      let newdateReg=createTopperRow();
      dateReg.replaceWith(newdateReg);
      Container.removeChild(Container.firstElementChild);
      let newDay=await createDayRows(newEndOfWeek, 1);
      Container.appendChild(newDay);
      await loadBlocks(newEndOfWeek, newDay);
    });
    containerScedule.appendChild(buttonNextDay);

    let buttonPrevDay=document.createElement("button");
		buttonPrevDay.className="buttonDefolt";
    buttonPrevDay.textContent="↑";
    buttonPrevDay.addEventListener("click", async function(e){
        let Container=document.querySelector(".grid");
        StartOfWeek.setDate(StartOfWeek.getDate()-1);

        let dateReg=document.querySelector(".week");
        let newdateReg=createTopperRow();
        dateReg.replaceWith(newdateReg);

        Container.removeChild(Container.lastElementChild);
        let newDay=await createDayRows(StartOfWeek, 1);
        Container.insertBefore(newDay, Container.firstChild);
        await loadBlocks(StartOfWeek, newDay);
    });
    containerScedule.appendChild(buttonPrevDay);
}
function getDayOfWeek(date) {
	  const daysOfTheWeekArr = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
	  const dayOfTheWeekIndex = date.getDay();
	  return daysOfTheWeekArr[dayOfTheWeekIndex];
}
async function DateWork(date, code, moreinfo){
    date=date.toLocaleDateString() //date.toJSON().split("T")[0];
    try {
      let response = await fetch('./backend/getDateInfo.php', {
        method:'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({ date: date, operationCode: code, moreinfo: moreinfo})
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      let data = await response.json(); // Обработка данных в формате JSON
      return data; // Возвращение обработанных данных
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      return null; // Возвращение null в случае ошибки
    }
}
async function loadBlocks(date, DayElem){
    date=date.toLocaleDateString()//date.toJSON().split("T")[0];
    try {
      let response = await fetch('./backend/getBlocks.php', {
        method:'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({ date: date})
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      let data = await response.json();
      
      let crewArr=data[data.length-1];
      for (let i=0;i<data.length-1;i++){
        date=new Date(data[i]["date_start"]);
        let block=createBlock({
            blockIdDB: data[i]["block_id"], 
            userId: data[i]["user_id"], 
            date: date, 
            timeStart: data[i]["time_start"], 
            crewId: crewArr.indexOf(data[i]["crew_id"])+1, 
            durationOfElement: data[i]["duration"],
            contractId: data[i]["contract_id"], 
            clientName: data[i]["client_name"],
            INN: data[i]["inn"],
            clientPhoneNumber: data[i]["phone_number"], 
            clientEmail: data[i]["email"],
            clientAdress: data[i]["adress"],
            authorContract: data[i]["contract_author"],
            dateOfContract: data[i]["date"],
            value: data[i]["cost"],
            commentOrder: data[i]["comment_to_order"], 
            commentContract: data[i]["comment_to_contract"], 
            taskName: data[i]["task_name"]});
    
        let hour=DayElem.querySelector(`div[data-date="${date.toLocaleDateString()}"][data-time-start="${data[i]['time_start']}"][data-level="${crewArr.indexOf(data[i]['crew_id'])+1}"]`);
        
        let Selector=hour.parentNode.querySelector(".crewSelector");
        let selectOption=Selector.querySelector(`option[value='${data[i]['crew_id']}']`);
        selectOption.selected = true;
        let event = new Event('change');
        Selector.dispatchEvent(event);
        
        state.currentBlock=block;
        //
        state.currentBlockInfo.duration=data[i]["duration"];
        state.currentBlockInfo.contractId=data[i]["contract_id"];
        state.currentBlockInfo.comment=data[i]["comment_to_order"];
        state.currentBlockInfo.taskName=data[i]["task_name"];
        
        dropElement(hour);
      }
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      return null;
    }
}
  async function createDayRows(date, rows){
    let RowDate=new Date(date.getTime()); //иначе получим ссылку на объект date, который меняется.
    // контейнер для строки
    let DayElementContainer=document.createElement("div");
    DayElementContainer.className="dayElementcontainer";
    // ячейка с днем недели
    let daysOfTheWeekCell = document.createElement("div");
    daysOfTheWeekCell.className = "cell";
    let dayOfWeek=getDayOfWeek(RowDate);
    daysOfTheWeekCell.textContent=`${dayOfWeek} ${date.toLocaleDateString().slice(0,5)}`;
    DayElementContainer.appendChild(daysOfTheWeekCell);

		if (dayOfWeek=="вс"){
      DayElementContainer.classList.add("dayElementcontainerHoliday");
      return DayElementContainer;
    }

    let dateInfo=await DateWork(date, "check", undefined);
    let existence=dateInfo[0]["existence"];
    let availability=dateInfo[0]["availability"];
    rows=dateInfo[0]["numrows"];
    if (RowDate < (new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()))){
      if (availability==="false"){
        DayElementContainer.classList.add("dayElementcontainerHoliday");
      } 
      else {
        DayElementContainer.classList.add("dayElementcontainerHoliday");
        //создание контейнера для уровней блоков
        let rowsContainer=document.createElement("div");
        rowsContainer.className="rowsContainer";
        DayElementContainer.appendChild(rowsContainer);
        //создание ячеек часов
        for (let i=1;i<=rows;i++){
          createHoursInRow(rowsContainer, RowDate, i,false);
        }
      }
    } 
    else {
      let rowsContainer;
      if (availability==="true") {
        //создание контейнера для уровней
        rowsContainer=document.createElement("div");
        rowsContainer.className="rowsContainer";
        DayElementContainer.appendChild(rowsContainer);
        //создание ячеек часов
        for (let i=1;i<=rows;i++){
          createHoursInRow(rowsContainer, RowDate, i,availability);
        }
        //создание кнопки добавления ячеек
        let buttonContainer=document.createElement("div");
        let buttonAddCrew=document.createElement("button");
        buttonAddCrew.innerHTML=`<svg width="18" height="18" viewBox="0 0 512 512">
          <path d="m256 .001c-141.158 0-255.999 114.841-255.999 255.999s114.841 255.999 255.999 255.999 255.999-114.84 255.999-255.999-114.841-255.999-255.999-255.999zm0 479.998c-123.513 0-223.999-100.486-223.999-223.999s100.486-223.999 223.999-223.999 223.999 100.485 223.999 223.999c0 123.513-100.486 223.999-223.999 223.999zm142-223.999c0 8.837-7.164 16-16 16h-110v110c0 8.837-7.164 16-16 16s-16-7.163-16-16v-110h-110c-8.836 0-16-7.163-16-16s7.164-16 16-16h110v-110c0-8.837 7.164-16 16-16s16 7.163 16 16v110h110c8.836 0 16 7.164 16 16z"/>
        </svg>`;
        buttonContainer.className="addHoursRow";
        buttonContainer.appendChild(buttonAddCrew);
        DayElementContainer.appendChild(buttonContainer);
        buttonAddCrew.addEventListener("click", async function(e){
          let request=await DateWork(date, "increaseNumrow", existence);
          if (request==true){
            rows++;
            createHoursInRow(rowsContainer, RowDate, rows);
          }
        });
      }
      else {
        DayElementContainer.classList.add("dayElementcontainerHoliday");
      }
      
      daysOfTheWeekCell.addEventListener("click", async function(e){
        
        if (availability==="false") {
          availability="true";
          let request=await DateWork(date, "delete", undefined);
          let newDay= await createDayRows(date, 1);
          DayElementContainer.replaceWith(newDay);
        }	
        else {
          availability="false";
          let request=await DateWork(date, "add", existence);
          if (existence==0){
            console.log(request[0]["response"]);
            existence=request[0]["existence"];
            console.log(existence);
          }
          else {
            console.log(request[0]["response"]);
          }

          for(let i=0;i<rows;i++){
            let elems=Array.from(rowsContainer.children[i].getElementsByClassName("block_contract"));
            if (elems.length!==0){
              let orderList=document.querySelector(".ordersContainer");
              for (let each of elems){
                orderList.appendChild(each);
                each.style.width="calc(100%)";
                each.style.backgroundColor="#c1c1cc";
                each.dataset.date=undefined;
                each.dataset.timeStart=undefined;
                each.dataset.level=undefined;
              }
            }
          }
          DayElementContainer.classList.add("dayElementcontainerHoliday");
          DayElementContainer.removeChild(DayElementContainer.lastElementChild);
          DayElementContainer.removeChild(DayElementContainer.lastElementChild);
        }
      });
    }
    
    return DayElementContainer;
  }
  function createHoursInRow(rowsContainer,date,level,availability){
    let Container=document.createElement("div");
    Container.className="hoursContainer";
    rowsContainer.appendChild(Container);
    if (scaleN==10){
      for (let k=0;k<10;k++) {
        let hour = document.createElement("div");
        hour.className = "date";
				if (availability===false) hour.classList.add("notAvailable");
        hour.dataset.blockId=undefined;
        hour.dataset.date=date.toLocaleDateString();
        hour.dataset.timeStart=hours[k];
        hour.dataset.level=level;
        hour.style.width=5+"vw";
        Container.appendChild(hour);

        hour.addEventListener("dragover",function(e){
          e.preventDefault();
        });
        hour.addEventListener("drop",function(e){
          if (!hour.classList.contains("notAvailable")) {
             dropElement(hour);
           } else {
              if (hour.dataset.blockId==state.currentBlock.dataset.id){
                dropElement(hour);
              }
            }
        });
      }
      let crewCell=document.createElement("div");
      crewCell.className="crewCell";

      let Selector=document.createElement("select");
      Selector.className="crewSelector";
      Selector.innerHTML=`${optionsOfSelector}`;
      //Selector.selectedIndex=-1;
      crewCell.appendChild(Selector);
			Container.appendChild(crewCell);

      //отмечаем поля которые уже выбраны в ранее созданных селекторах
      var allSelects = rowsContainer.querySelectorAll('select');
      var selectedValues = new Set();
      allSelects.forEach(function(s) {
          if (s !== Selector) {
              selectedValues.add(s.value);
          }
      });
      Array.from(Selector.options).forEach(function(option) {
        option.disabled = selectedValues.has(option.value);
      });

      let firstEnabledOption = Array.from(Selector.options).find(option => !option.disabled);
      if (firstEnabledOption) {
        Selector.value = firstEnabledOption.value;
      }  
      if (date < (new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()))){
        Selector.disabled=true;
      }
      else {
        Selector.addEventListener('change', async function() {
          var allSelects = rowsContainer.querySelectorAll('select');
          var selectedValues = new Set();
          selectedValues.add(Selector.value);
          allSelects.forEach(function(s) {
              if (s !== Selector) {
                  selectedValues.add(s.value);
              }
          });
          allSelects.forEach(function(s) {
                  Array.from(s.options).forEach(function(option) {
                      option.disabled = selectedValues.has(option.value);
                  });
          });
          // обновляем информацию для всех блоков 
          let elems=Array.from(Container.getElementsByClassName("block_contract"));
          if (elems.length!==0){
            for (let each of elems){
              console.log(each.dataset.date,  each.dataset.timeStart+":00", state.blocksIdArray[each.dataset.id],Selector.value);
              let response = await fetch('./backend/changeBlockPosition.php', {
                method:'POST',
                headers: {
                  'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({ date: each.dataset.date, time: each.dataset.timeStart+":00", block_id: state.blocksIdArray[each.dataset.id], crew_id:Selector.value})
              });
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              let data = await response.text();
              if (data=="true") console.log("Данные о экипаже успешно обновлены"); else console.log("ошибка");
            }
          }
        });
        // вызываем слушатель, чтобы исключить выбранное значение из ранее созданных селекторов
          let event = new Event('change');
          Selector.dispatchEvent(event);
      }
        
			  if (availability!=="false") {
				let deleteRowButton=document.createElement("button");
				deleteRowButton.className="proclick";
				deleteRowButton.innerHTML=`
				<svg version="1.1" width="24" height="24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
					<path style="fill: rgb(255, 255, 255,0);" d="M256,508C117.048,508,4,394.952,4,256S117.048,4,256,4s252,113.048,252,252S394.952,508,256,508z" fill="#FFFFFF"></path>
					<path style="fill: rgb(0, 0, 0,0);" d="M256,8c136.744,0,248,111.256,248,248S392.744,504,256,504S8,392.744,8,256S119.256,8,256,8 M256,0 C114.616,0,0,114.616,0,256s114.616,256,256,256s256-114.616,256-256S397.384,0,256,0L256,0z" fill="#000000"></path>
					<path d="M354.376,371.536c-5.12,0-10.232-1.952-14.144-5.856L146.408,171.848c-7.816-7.816-7.816-20.472,0-28.28 s20.472-7.816,28.28,0L368.52,337.4c7.816,7.816,7.816,20.472,0,28.28C364.608,369.584,359.496,371.536,354.376,371.536z" fill="#000000" style="fill: rgb(0, 0, 0);"></path>
					<path d="M160.544,371.536c-5.12,0-10.232-1.952-14.144-5.856c-7.816-7.816-7.816-20.472,0-28.28l193.832-193.832 c7.816-7.816,20.472-7.816,28.28,0s7.816,20.472,0,28.28L174.688,365.68C170.784,369.584,165.664,371.536,160.544,371.536z" fill="#000000" style="fill: rgb(0, 0, 0);"></path>
				</svg>`;
        if (date >= (new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()))){
				deleteRowButton.addEventListener("click", async function(){ 
          
					if (rowsContainer.children.length>1){
            let request=await DateWork(date, "decreaseNumrow", undefined);
            //console.log("уменьшенеие количества строк прошло: "+request);
            if (request==true){
              var allSelects = rowsContainer.querySelectorAll('select');
              allSelects.forEach(function(s) {
              if (s !== Selector) {
                Array.from(s.options).forEach(function(option) {
                  if (option.value==Selector.value) option.disabled = false;
                });
              }
             });
              let elems=Array.from(Container.getElementsByClassName("block_contract"));
              if (elems.length!==0){
                let orderList=document.querySelector(".ordersContainer");
                for (let each of elems){
                  orderList.appendChild(each);
                  each.style.width="calc(100%)";
                  each.style.backgroundColor="#c1c1cc";
                  each.dataset.date=undefined;
                  each.dataset.timeStart=undefined;
                  each.dataset.level=undefined;
                }
              }
              rowsContainer.removeChild(Container);
            }
					}
				});
        }
				crewCell.appendChild(deleteRowButton);
	    }
		}
  }
  let scaleN=10;
  const hours=[9,10,11,12,13,14,15,16,17,18,19];
  let optionsOfSelector;
  let StartOfWeek;

async function renderGrid(){
    let Container=document.createElement("div");
    Container.className="grid";
    for (let i=0;i<7;i++){
      let dateOfRow=new Date(StartOfWeek.getTime()); //нужно попасть в нужный месяц, тк setDate() устанавливает дату в том месяце
      dateOfRow.setDate(StartOfWeek.getDate() + i);
      let newDay= await createDayRows(dateOfRow, 1);
      Container.appendChild(newDay);
      setTimeout(function() {
        loadBlocks(dateOfRow, newDay);
      }, 500);
    }
    return Container;
}

export async function initGrid(dateStartOfWeek, optionsOfSelector1){
    const containerScedule = document.querySelector(".scedule");
    
    StartOfWeek=dateStartOfWeek;
    optionsOfSelector=optionsOfSelector1;

    let dateRow=createTopperRow();
    containerScedule.appendChild(dateRow);
    let scale=createScale();
    containerScedule.appendChild(scale);
    containerScedule.appendChild(await renderGrid());
    createButton();
}