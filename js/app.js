import { createBlock } from "./block.js";
import modalModule from "./modal.js";
import {initGrid} from "./schedule.js";
import {state} from "./state.js";
  async function main(){

    async function LoadCrew(){
      let body=document.querySelector(".crewsContainer");
      let crewList=Array();
      try {
        let response = await fetch('./backend/getCrewInfo.php');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        let data = await response.json();
        for (let i=0;i<data.length;i++){
          let block=createCrewElement(data[i]["crew_name"], data[i]["crew_list"]);
          body.appendChild(block);
          let crew={
            'crew_id': data[i]["crew_id"],
            'crew_name': data[i]["crew_name"]
          }
          crewList.push(crew);
        }
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        return null; 
      }
      return crewList;
    }
    function createCrewElement(crew_name, crew_list){
      let block=document.createElement("div");
      block.className="crewBlock";
      let crewListRow="";
      for(let i=0; i<crew_list.length; i++){
        crewListRow=crewListRow + crew_list[i]["2"] + ' ' + crew_list[i]["1"][0] + '. ';
      }
      block.innerHTML=`<div class="blockInnerText">${crew_name}<br>${crewListRow}</div>`;
      block.addEventListener("click", function(){
        let crewListRow="";
        for(let i=0; i<crew_list.length; i++){
          crewListRow=crewListRow + '- ' + crew_list[i]["2"] + ' ' + crew_list[i]["1"] + '<br>';
        }

        const template =`
        <div class="modal_box">
          <div class="modal_box_container" style="width:80%; display:flex; flex-direction: column;">
            <h1>Информация об экипаже</h1>
            <span>${crew_name}</span>
            <span>Состав:<br>${crewListRow}</span>
          </div>
          <!--<button class="modalWindow-btn" id="modalWindowWatchCrew-btn-EditCrew">Редактировать</button> -->
          <button class="modalWindow-btn" id="btn-close">Закрыть</button>
          <!--<button class="modalWindow-btn" id="modalWindowWatchCrew-btn-DeleteCrew">Удалить</button>-->
        </div>`;
        const handlers = {};
        modalModule.open({template, handlers});
      });
      return block;
    }
  // слушатель на кнопку профиль
    document.getElementById("profile").addEventListener("click", async function(e){
      const template=`
      <div class="modal_box">
        <div class="modal_box_container">
          <span><b>${state.user.surname} ${state.user.name}</b></span>
          <span>Старый пароль:</span>
          <input type="password" id="OldPassword">
          <span>Новый пароль:</span>
          <input type="password" id="NewPassword">
          <span id="message" hidden></span>
          <div style="display:flex; flex-direction: row; justify-content: center;">
            <button class="modalWindow-btn" id="btn-changePassword" >Сменить пароль</button>
            <button class="modalWindow-btn" id="btn-out">Выйти</button>
            <button class="modalWindow-btn" id="btn-close">Закрыть</button>
          </div>
        </div>
      </div>`;
      const handlers = {
        "#btn-out": ()=>{
          document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie = "name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie = "surname=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          window.location.href = 'login.html';  
        },
        "#btn-changePassword": async()=>{
          let newPassword=modalwindow.querySelector("#NewPassword").value;
          let oldPassword=modalwindow.querySelector("#OldPassword").value;
          if ((newPassword.length!=0)||(oldPassword.length!=0)){
              if (newPassword!=oldPassword){
                let response = await fetch('./backend/changePassword.php', {
                  method:'POST',
                  headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                  },
                  body: JSON.stringify({ newPass: newPassword, oldPass: oldPassword, userID: state.user.userId })
                });
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }
                let data = await response.text();
                let message=modalwindow.querySelector("#message");
                message.hidden=false;
                message.style.color="#a3a3d9";
                message.textContent=data;
              }
              else {
                let message=modalwindow.querySelector("#message");
                message.hidden=false;
                message.style.color="red";
                message.textContent="Новый пароль должен отличатся от старого";
              }
          }
          else {
            let message=modalwindow.querySelector("#message");
            message.hidden=false;
            message.style.color="red";
            message.textContent="Заполните все поля!";
          }
        }
       };
       let modalwindow = modalModule.open({template, handlers});
  });
	//слушатель на кнопку - вызов модального окна создания нового экипажа
    document.getElementById("modalWindowCreateNewСrew-btn-open").addEventListener("click", async function(e){
        let response = await fetch('./backend/getWorkersInfo.php');
        let data = await response.json(); // Обработка данных в формате JSON

        const template = `
        <div class="modal_box">
          <div class="modal_box_container">
            <h1>Создание нового экипажа</h1>
            <span>Название нового экипажа:</span>
            <input type="text" id=nameOfCrew>
            <span>Выберите состав:</span>
            <div class="workersContainer"></div>
            <div style="display:flex; flex-direction: row; justify-content: center; margin-top:2vh;">
              <button class="modalWindow-btn" id="modalWindowCreateNewCrew-btn-addBlock" >Создать</button>
              <button class="modalWindow-btn" id="btn-close">Закрыть</button>
            </div>
          </div>
        </div>`;
 
        const handlers = {
          "#modalWindowCreateNewCrew-btn-addBlock": async ()=>{
                let nameOfCrew=document.querySelector("#nameOfCrew").value;
                let selectedCheckBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
                let checkedValues = Array.from(selectedCheckBoxes).map(cb => cb.value);

                if ((nameOfCrew.trim() == '')||(checkedValues.length==0)) { 
                  let modalBoxContainer=modalwindow.querySelector(".modal_box_container");
                  let alarm=document.createElement("span");
                  alarm.className="alarmText";
                  alarm.innerHTML="Заполните все поля";
                  modalBoxContainer.insertBefore(alarm, modalBoxContainer.children[4]);
                  //modalBoxContainer.appendChild(alarm);
                  //document.querySelector("#nameOfCrew").placeholder="Заполните это поле!";
                  return 
                }
                try {
                  let response = await fetch('./backend/addCrew.php', {
                    method:'POST',
                    headers: {
                      'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify({ nameOfCrew: nameOfCrew, workers: checkedValues})
                  });
                  if (!response.ok) {
                    throw new Error('Network response was not ok');
                  }
                  /*let data = await response.text(); // Обработка данных в формате JSON
                  alert("Успешно!");
                  */
                } catch (error) {
                  console.error('There was a problem with the fetch operation:', error);
                  alert("Не Успешно!");
                } 
                modalModule.close();

                let OLDworkersContainer=document.querySelector(".crewsContainer");
                let NEWworkersContainer=document.createElement("div");
                NEWworkersContainer.className="crewsContainer";
                OLDworkersContainer.replaceWith(NEWworkersContainer);
                let crewList=await LoadCrew();
                optionsOfSelector='';
                for (let i=0; i < crewList.length; i++){
                  optionsOfSelector += `<option value="${crewList[i]['crew_id']}"> ${crewList[i]['crew_name']}</option>`;
                }
                updateSelectors();
          }
        } 
        const modalwindow=modalModule.open({template, handlers});
        let workersContainer=modalwindow.querySelector(".workersContainer");
        for (let i=0; i<data.length; i++){
          let newWorker=document.createElement("div");
          newWorker.innerHTML=`<input type="checkbox" id="${i}" value="${data[i]['user_id']}" style="vertical-align:middle;"/><label for="${i}">${data[i]['user_name']} ${data[i]['user_surname']}</label>`;
          workersContainer.appendChild(newWorker);
        }
      });

    async function updateSelectors() {
      // Получаем все селекторы
      let selectors = document.querySelectorAll('.crewSelector');
      // Добавляем новые элементы option во все селекторы
      selectors.forEach(selector => {
        selector.innerHTML = optionsOfSelector;
      });
    }
	
  //модальное окно создание нового блока
  document.getElementById("modalWindowCreateNewBlock-btn-open").addEventListener("click", function(e){
    
    const template=`
      <div class="modal_box">
        <div class="modal_box_container">
          <h1>Создание выезда по рекламации</h1>
          <span>Название задачи:</span>
          <input type="text" id="nameOfTask"></input>
          <span>Номер договора:</span>
          <input type="number" id="contractNumber"></input>
          <!-- <span>Адрес:</span>
          <input type="text" id="adress"></input> -->
          <span>Продолжительность задачи (ч):</span>
          <input type="number" id="taskDuration"></input>
          <span>Комментарий:</span>
          <textarea id="comment" type="text" rows="5" ></textarea>
          <div style="display:flex; flex-direction: row; justify-content: center; margin-top:2vh;">
            <button class="modalWindow-btn" id="modalWindowCreateNewBlock-btn-addBlock">Создать</button>
            <button class="modalWindow-btn" id="btn-close">Закрыть</button>
          </div>
        </div>
      </div>`;

    const handlers={
      '#modalWindowCreateNewBlock-btn-addBlock': async ()=> {
          let nameOfTask=modalwindow.querySelector("#nameOfTask").value;
          let contractNumber=modalwindow.querySelector("#contractNumber").value;
          //let adress=modalwindow.querySelector("#adress").value;
          let taskDuration=modalwindow.querySelector("#taskDuration").value;
          let comment=modalwindow.querySelector("#comment").value;
          if (nameOfTask.trim() == ''||Number(contractNumber) === 0 || Number(taskDuration) === 0) { 
            let existingAlarm = modalwindow.querySelector(".alarmText");
            if (!existingAlarm){
              let modalBoxContainer=modalwindow.querySelector(".modal_box_container");
              let alarm=document.createElement("span");
              alarm.className="alarmText";
              alarm.innerHTML="Заполните все поля";
              modalBoxContainer.insertBefore(alarm, modalBoxContainer.children[9]);
            }
            return; 
          }
          let block=createBlock({ 
            blockIdDB: "undefined",
            date: "undefined",
            timeStart: "undefined",
            crewId:"undefined",
            durationOfElement: taskDuration, 
            contractId: "undefined",
            clientName: "undefined",
            INN: "undefined",
            clientPhoneNumber: "undefined",
            clientEmail:"undefined",
            clientAdress: "undefined",
            authorContract: "undefined",
            dateOfContract :"undefined",
            value: "undefined",
            commentOrder: comment, 
            commentContract:"undefined", 
            taskName:nameOfTask + " по договору " + contractNumber});

          let ordersContainer = document.querySelector(".ordersContainer");
          ordersContainer.appendChild(block);
          modalModule.close(); 
      }
    }
    const modalwindow = modalModule.open({ template, handlers });
  });
  //Создание блоков контрактов
  async function LoadContracts() {
    let body = document.querySelector(".ordersContainer");
    try {
      let response = await fetch('./backend/getBlockInfo2.php');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      let data = await response.json(); // Обработка данных в формате JSON
      console.log(data);
      for (let i=0;i<data.length;i++){
        let block=createBlock(
        { 
          blockIdDB: "undefined", // значение undefined, потому что контрактов, которые здесь загружаются, нет в таблице расписания. Соответственно и в таблице БД с блоками
          date: "undefined",
          timeStart: "undefined",
          crewId:"undefined",
          durationOfElement: data[i]["duration"], 
          contractId: data[i]["contract_id"],
          clientName: data[i]["client_name"],
          INN: data[i]["inn"],
          clientPhoneNumber: data[i]["phone_number"],
          clientEmail: data[i]["email"],
          clientAdress: data[i]["adress"],
          authorContract:data[i]["contract_author"],
          dateOfContract :data[i]["date"],
          value: data[i]["cost"],
          commentOrder: "", 
          commentContract:data[i]["comment"], 
          taskName:data[i]["task_name"]
        });
        body.appendChild(block);
      }
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      return null; 
    }
  }
    // Начало 
    // Закружаем блоки экипажей
    let CrewList=await LoadCrew();
    
    // Заполняем селекторы экипажей "вариантами выбора"
    let optionsOfSelector='';
    for (let i=0; i < CrewList.length; i++){
      optionsOfSelector += `<option value="${CrewList[i]['crew_id']}"> ${CrewList[i]['crew_name']}</option>`;
    }

    //Рисуем сетку
    let StartOfWeek=new Date();
    StartOfWeek=new Date(StartOfWeek.getFullYear(), StartOfWeek.getMonth(),StartOfWeek.getDate());
    await initGrid(StartOfWeek,optionsOfSelector);

    //Загружаем блоки контрактов
    LoadContracts();

    }


    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.startsWith('user_id=')) {
        state.user.userId=cookie.substring(8, cookie.length);
      }
      if (cookie.startsWith('name=')) {
        state.user.name=cookie.substring(5, cookie.length);
      }
      if (cookie.startsWith('surname=')) {
        state.user.surname=cookie.substring(8, cookie.length);
      }
      if (cookie.startsWith('role=')) {
        state.user.role=cookie.substring(5, cookie.length);
      } 
    }
    if (state.user.role=="2"){
      if (state.user.userId && state.user.name && state.user.surname) main();
      else window.location.href = 'login.html';   
    }

    else window.location.href = 'login.html';
