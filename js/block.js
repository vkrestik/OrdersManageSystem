import modalModule from "./modal.js";
import {state} from "./state.js";

function getColor(i){
    const colors=["#D9D1E6","#FA5AAD","#FFC9D7","#FFCCB0","#FFDE86","#F9F871","#1E6A5B","#67d6baff","#99D580","#3678D3"];
    return colors[i];
}

export function createBlock({ blockIdDB, date, timeStart,level,durationOfElement, contractId, clientName,INN,clientPhoneNumber, clientEmail,clientAdress,authorContract,dateOfContract ,value,commentOrder, commentContract, taskName}){  
    state.blocksIdArray.push(blockIdDB);
    let blockIdOnGrid=state.blocksIdArray.length-1; 

    const block=document.createElement("div");
    block.className="block_contract";

    if (contractId!=="undefined")
      block.innerHTML=`<div class="blockInnerText">Договор ${contractId}<br>${clientAdress}</div>`;
    else block.innerHTML=`<div class="blockInnerText">${taskName}<br></div>`;
    
    //здесь создаем блоки, которые невозможно перемещать, из за прошедшей даты
    if (date < (new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()))){
      block.style.opacity="0.4";
      block.style.width=`calc(${durationOfElement}*100% + ${durationOfElement-1}*0.05vw)`; //${100/screen.width}*2
      block.dataset.date=date.toLocaleDateString();
      block.dataset.timeStart=timeStart;
      block.dataset.level=level;
      return block;
    } 

    block.draggable=true;
    let color=getColor(Math.floor(Math.random() * 10));
    let clone;
    block.dataset.id=blockIdOnGrid;
    if (state.blocksIdArray[blockIdOnGrid]!=="undefined") { //если мы создаем блок для таблицы, а не для списка (автоматическое создание)
      block.dataset.date=date.toLocaleDateString();
      block.dataset.timeStart=timeStart;
      block.dataset.level=level;
      block.style.width=`calc(${durationOfElement}*100% + ${durationOfElement-1}*0.05vw)`; //${100/screen.width}*2
      block.style.backgroundColor=`${color}`;
    }
    else {
      block.dataset.date=undefined;
      block.dataset.timeStart=undefined;
      block.dataset.level=undefined;
    }

    block.addEventListener("dragstart", function(event){

      state.currentBlockInfo.comment=commentOrder;
      state.currentBlockInfo.duration=durationOfElement;
      state.currentBlockInfo.contractId=contractId;
      state.currentBlockInfo.taskName=taskName;
      
      clone=event.target.cloneNode(true);
      clone.id="drag-ghost";
      clone.style.backgroundColor=`${color}`;
      clone.style.width=`calc(${state.currentBlockInfo.duration} * ${document.querySelector(".date").style.width})`;
      clone.style.position="absolute";
      clone.style.top = "-1000px";
      document.body.appendChild(clone);
      //event.dataTransfer.dropEffect = 'none';
      //event.dataTransfer.setDragImage(clone,5,5);
      block.classList.add("invisible");
      state.currentBlock=event.target;//!!!!!!
    });
    block.addEventListener("drag",function(e){
      clone.style.top=e.pageY+1+'px';
      clone.style.left=e.pageX+1+'px';
    });
    block.addEventListener("dragend", function(e){
      if(block.parentNode!=document.querySelector(".ordersContainer"))
        block.style.backgroundColor=`${color}`;
      clone.remove()
      block.classList.remove("invisible");
    });
    
    block.addEventListener("click", function(e){
      let template;
      if (contractId=="undefined"){
        template=`<div class="modal_box">
          <div class="modal_box_container" style="width:80%; display:flex; flex-direction: column;">
              <h1>Информация о выезде по рекламации</h1>
              <span>${taskName}</span>
              <!-- <span>Адрес: ${clientAdress}</span> -->
              <span>Описание задачи:</span>
              <textarea id="textArea">${commentOrder}</textarea>
              <div style="display:flex; flex-direction: row; justify-content: center;">
                <button class="modalWindow-btn" id="btn-close">Закрыть</button>
              </div>  
          </div>
        </div>`;
      }
      else {
        if (commentContract=="undefined") commentContract="";
        template=`<div class="modal_box">
          <div class="modal_box_container">
              <h1>Информация о договоре</h1>
              <span>Номер договора: ${contractId}</span>
              <span>Покупатель: ${clientName}</span>
              <span>Телефон: ${clientPhoneNumber}</span>
              <span>Почта: ${clientEmail}</span>
              <span>ИНН: ${INN}</span>
              <span>Адрес: ${clientAdress}</span>
              <span>Комментарий к договору: ${commentContract}</span>
              <span>Дата договора: ${dateOfContract}</span>
              <span>Автор: ${authorContract}</span>
              <span>Стоимость: ${value} р</span>
              <span>Комментарий к заказу: </span>
              <textarea id="textArea">${commentOrder}</textarea>
              <div style="display:flex; flex-direction: row; justify-content: center;">
                <button class="modalWindow-btn" id="btn-close">Закрыть</button>
              </div>  
          </div>
        </div>`;
      }
      const handlers= {}
      const modalwindow= modalModule.open({template,handlers})

      let textarea=modalwindow.querySelector("#textArea");
      
      textarea.addEventListener("change", async function(){
        let value = textarea.value;
        let response = await fetch('./backend/changeComment.php', {
          method:'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify({ text: value, block_id: state.blocksIdArray[blockIdOnGrid]})
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        commentOrder=value;
      });
    });



    block.addEventListener("contextmenu", async function(e){
      
      let response = await fetch('./backend/deleteBlockPosition.php', {
        method:'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({ block_id: state.blocksIdArray[blockIdOnGrid]})
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      let data = await response.text();
      if (data!="true") { 
        console.log("error"); 
        return
      }
      state.blocksIdArray[blockIdOnGrid]="undefined";
			for(let i=0;i<durationOfElement;i++){
        let onCleanCell=document.querySelector(`div[data-date="${block.dataset.date}"][data-time-start="${parseInt(block.dataset.timeStart)+i}"][data-level="${block.dataset.level}"]`);
        onCleanCell.classList.remove("notAvailable");
        onCleanCell.dataset.blockId=undefined;
      }
      let orderList=document.querySelector(".ordersContainer");
      orderList.appendChild(block);
      block.style.width="calc(100%)";
      block.style.backgroundColor="#c1c1cc";
      block.dataset.date=undefined;
      block.dataset.timeStart=undefined;
      block.dataset.level=undefined;
    });
    return block;
}
export function dropElement(hour){

    let Selector=hour.parentNode.querySelector(".crewSelector");
    let parts = hour.dataset.date.split('.'); // Разбиваем строку даты на части по разделителю "."
    // Создаем новый объект Date, указывая год, месяц (уменьшаем на 1, так как месяцы в Date начинаются с 0), и день
    let date = new Date(parts[2], parts[1] - 1, parts[0]);
    if (date>= (new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()))){
      for(let i=1;i<state.currentBlockInfo.duration;i++){
        let onCheckingCell=document.querySelector(`div[data-date="${hour.dataset.date}"][data-time-start="${parseInt(hour.dataset.timeStart)+i}"][data-level="${hour.dataset.level}"]`);
        if (!onCheckingCell.classList.contains("notAvailable") || (onCheckingCell.dataset.blockId==state.currentBlock.dataset.id)) { continue; }
        else { return; }
      }
    }
    if (state.blocksIdArray[state.currentBlock.dataset.id]=="undefined"){ //если блока еще нет в таблице, то у него нет block_id те id в БД
      //если у блока не задан contractID, то этот блок создан с помошью кнопки
      if (state.currentBlockInfo.contractId=="undefined") state.currentBlockInfo.contractId=0;

      new Promise((resolve, reject) => {
        fetch('./backend/insertBlock.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify({ 
            duration: state.currentBlockInfo.duration, 
            task_name: state.currentBlockInfo.taskName, 
            date: hour.dataset.date, 
            time: hour.dataset.timeStart + ":00", 
            comment: state.currentBlockInfo.comment, 
            contract_id: state.currentBlockInfo.contractId, 
            user_id: state.user.userId, 
            crew_id: Selector.value })
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.text();
          })
          .then(data => {
            if (data !== "error") {
              console.log(data);
              state.blocksIdArray[state.currentBlock.dataset.id] = data;
              resolve('Block inserted successfully');
            } else {
              console.log("error");
              reject('Error occurred while inserting block');
              return;
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    } 
    else {
        new Promise((resolve, reject) => {
        fetch('./backend/changeBlockPosition.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify({ date: hour.dataset.date, time: hour.dataset.timeStart + ":00", block_id: state.blocksIdArray[state.currentBlock.dataset.id], crew_id: Selector.value })
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.text();
          })
          .then(data => {
            if (data !== "true") {
              console.log("error");
              reject('Error occurred while changing block position');
              return;
            } else {
              if (state.currentBlock.dataset.date!=="undefined"){ // если блок уже занимал место в таблице, то происходит отчистка занимаемых ячеек
                for(let i=0;i<state.currentBlockInfo.duration;i++){
                  let onCleanCell=document.querySelector(`div[data-date="${state.currentBlock.dataset.date}"][data-time-start="${parseInt(state.currentBlock.dataset.timeStart)+i}"][data-level="${state.currentBlock.dataset.level}"]`);
                  onCleanCell.classList.remove("notAvailable");
                  onCleanCell.dataset.blockId=undefined;
                }
              }
              resolve('Block position changed successfully');
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    }
      hour.appendChild(state.currentBlock);
      state.currentBlock.style.width=`calc(${state.currentBlockInfo.duration}*100% + ${state.currentBlockInfo.duration-1}*0.05vw)`; //${100/screen.width}*2
      state.currentBlock.dataset.date=hour.dataset.date;
      state.currentBlock.dataset.timeStart=hour.dataset.timeStart;
      state.currentBlock.dataset.level=hour.dataset.level;
      hour.dataset.blockId=state.currentBlock.dataset.id;
      for(let i=0;i<state.currentBlockInfo.duration;i++){
        let onMarkingCell=document.querySelector(`div[data-date="${hour.dataset.date}"][data-time-start="${parseInt(hour.dataset.timeStart)+i}"][data-level="${hour.dataset.level}"]`);
        if (onMarkingCell.classList.contains("notAvailable")) continue;
        onMarkingCell.classList.add("notAvailable");
        onMarkingCell.dataset.blockId=state.currentBlock.dataset.id;
      }
  }