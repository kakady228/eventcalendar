<template>
  <div class="d-flex py-1">

    <div class="div-table col-sm-8">

      <div class="d-flex justify-content-between mb-3">
        <button @click="prevPage" :disabled="pageNumber == 0" class="btn btn-success">Prev</button>
        <button @click="nextPage" :disabled="pageNumber >= pageCount()-1" class="btn btn-success">Next</button>
      </div>

      <div class="calendar-container">
        
        <div class="calendar-header">
          <ul class="daynumbers">
            <li v-for="date in paginatedData()" :key="date.i">
              {{ date.date }}
            </li>
          </ul>
        </div>

        <div class="timeslots-container">
          <ul class="timeslots">
            <li v-for="user in users" :key="user.i">
              {{ user.firstName + ' ' + user.surname }}  
            </li>
          </ul>
        </div>

        <div class="event-container">
          <div v-for="supereven in superevent" :key="supereven.i" class="event-slot slot-1">
            <div class="event-status"></div>
            <span :title="supereven.name">{{ supereven.name }}</span>
          </div>
          <!-- <div class="event-slot slot-1">
            <div class="event-status"></div>
            <span>Event A</span>
          </div> -->
        </div>

      </div>

    </div> 


    <!-- BACKLOG -->

    <div class="backlog col-sm-4 p-1 bg-grey sticky-top">
      <h1>Backlog</h1>
      <input class="w-100" @input="backlogSearch" v-model="searchField" type="search" placeholder="Поиск">
      <div class="backlog-card-list">
        <div class="backlog-card card my-1 text-start" v-for="task in filteredBacklog" :key="task.i" draggable="true">
          <div @click="addTask(task.id, task.planStartDate, task.planEndDate, task.subject, task.executor)" class="card-header color-blue fw-bold">
            {{ task.subject }}
          </div>
          <div class="card-body">
            <p>
              {{ task.description ? task.description : 'Task description should be here' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

import Task from '@/Models/Task';
import User from '@/Models/User';

@Options({
  props: {
    msg: String
  },
  components: {
  }
})
export default class Calendar extends Vue {
  data() {
    return{
      users: [],
      tasks: [],
      backlog: [],
      pageNumber: 0,
      listData: {
        type: Array,
        required: false
      },
      size: {
        type:Number,
        required:false,
        default: 7
      },
      superevent: [],
    }
  }
  superevent: any;

  users: User[] = [];
  tasks: Task[] = [];
  backlog: Task[] = [];
  signedTasks: Task[] = [];
  filteredBacklog: Task[] = [];
  searchField: string = '';

  pageNumber: number = 0;
  listData: any[] = [
    // { date: "2021-10-01" },
    // { date: "2021-10-02" },
    // { date: "2021-10-03" },
    // { date: "2021-10-04" },
    // { date: "2021-10-05" },
    // { date: "2021-10-06" },
    // { date: "2021-10-07" },
    // { date: "2021-10-08" },
    // { date: "2021-10-09" },
    // { date: "2021-10-10" },
    // { date: "2021-10-11" },
    // { date: "2021-10-12" },
    // { date: "2021-10-13" },
    // { date: "2021-10-14" },
    // { date: "2021-10-15" },
    { date: "2021-10-16" },
    { date: "2021-10-17" },
    { date: "2021-10-18" },
    { date: "2021-10-19" },
    { date: "2021-10-20" },
    { date: "2021-10-21" },
    { date: "2021-10-22" },
    { date: "2021-10-23" },
    { date: "2021-10-24" },
    { date: "2021-10-25" },
    { date: "2021-10-26" },
    { date: "2021-10-27" },
    { date: "2021-10-28" },
    { date: "2021-10-29" },
    { date: "2021-10-30" },
    { date: "2021-10-31" },
  ];
  size: number = 7;
  renderComponent: any;

  events: any[] = [];
  eventsByDay: any = {};
  daysInaWeek: number = 7;
  sections: number = this.daysInaWeek;

  addTask(id: string, startDate: string, endDate: string, subject: string, executor: number = 5) {
    const event = {
      id: id,
      startDate: startDate,
      endDate: endDate,
      name: subject,
      executor: 5
    };

    this.events = [];
    this.events.push(event);
    this.processEvents();
    this.loadEvents();
  }

  processEvents() {
    this.events.forEach(event => {
      const cell = Number(this.getCell(event.executor));

      if(!this.eventsByDay[event.startDate]) {
        this.eventsByDay[event.startDate] = {};
        this.eventsByDay[event.startDate][cell] = [];
      }

      if(!this.eventsByDay[event.startDate][cell]) {
        this.eventsByDay[event.startDate][cell] = [];
      }

      this.eventsByDay[event.startDate][cell].push(event);
    });
  }

  // sortcomparer(e1: any, e2: any) {
  //   const t1start = timeFromString(e1.starttime);
  //   const t1end = timeFromString(e1.endtime);
  //   const t2start = timeFromString(e2.starttime);
  //   const t2end = timeFromString(e2.endtime);

  //   //return t1start.getTime() - t2start.getTime();
  //   const t1 = +(t1end - t1start);
  //   const t2 = +(t2end - t2start);

  //   return t2 - t1;
  // }

  loadEvents() {
    Object.keys(this.eventsByDay).forEach(el => {
      const eventsForThisDay = this.eventsByDay[el];

      Object.keys(eventsForThisDay).forEach(c => {
        const events = eventsForThisDay[c];
        
        var totalEventsPerCell = events.length;
        
        var offset = 0;

        for (let i = 0; i < events.length; i++) {
          const event = events[i];

          const colPos = this.getColumnPosition(event.startDate);
          const perc = 100 / (this.sections + 1 - colPos);
          const percW = Math.floor(perc / totalEventsPerCell);

          var wMultiplier = 1.5;

          if(offset === totalEventsPerCell - 1) {
            wMultiplier = 0.95;
          }

          event["width"] = percW * wMultiplier;
          event["left"] = percW * offset;
          event["time"] = `${event.startDate} - ${event.endDate}`;
          this.renderEvent(event);
          this.superevent.push(event);
          console.log(this.superevent);
        }
      });
    });
  }

  renderEvent(event: any) {

    var eventSlot = document.createElement("div");
    var oneEvent = document.createElement("div");
    var eventStatus = document.createElement("div");
    var eventName = document.createElement("div");
    var eventTime = document.createElement("div");

    
    const color = "darkslategray";
    eventName.innerHTML = `${event.name}`;
    eventTime.innerHTML = `${event.startDate}`;

    
    // console.log(oneEvent);
    

    // var asd = document.querySelector(".event-container");
    // asd!.appendChild(oneEvent);
    // oneEvent!.appendChild(eventStatus);
    // oneEvent!.appendChild(eventName);
    // oneEvent!.appendChild(eventTime);

    // asd!.appendChild()
    eventSlot.setAttribute("class", "event-slot");
    eventName.setAttribute("class", "event-name");
    eventTime.setAttribute("class", "event-name");
    eventStatus.setAttribute("class", "event-status");
    oneEvent.setAttribute("class", "event-slot slot-1");
  }

  getColumnPosition(startdate: string) {
    const y = +startdate.split("-")[0];
    const m = +startdate.split("-")[1];
    const d = +startdate.split("-")[2];

    const date = new Date(y, m - 1, d);
    return date.getDay() + 1;
  }

  getCell(executor: number) {
    const h = executor;
  }


// PAGINATION
  nextPage() {
    this.pageNumber++;
  }

  prevPage() {
    this.pageNumber--;
  }

  pageCount() {
    let length = this.listData.length;
    let size = this.size;

    return Math.ceil(length/size);
  }

  paginatedData() {
    const start = this.pageNumber * this.size,
    end = start + this.size;
    return this.listData.slice(start, end);
  }
// PAGINATION

// Created Hook
  created() {

    fetch('https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users?limit=7')
      .then(response => response.json())
      .then(data => {
        this.users = data;
      })

    fetch('https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks')
      .then(response => response.json())
      .then(data => {
        this.tasks = data;

        this.backlog = this.tasks.filter((el: any) => {
          var backlogArr = [];

          if (el.executor == null) {

            return backlogArr.push(el);

          }

        });

        this.signedTasks = this.tasks = this.tasks.filter((el: any) => {
          var signedTasks = [];

          if (el.executor) {
            return signedTasks.push(el);
          }
        })
        this.filteredBacklog = this.backlog;

      })
      
  }

  // Mounted Hook
  mounted() {

    const tasksListElement = document.querySelector(`.backlog-card-list`);
    const taskElements = tasksListElement!.querySelectorAll(`.backlog-card`);

    tasksListElement!.addEventListener(`dragstart`, (evt: any) => {
      evt.target.classList.add(`selected`);
    })

    tasksListElement!.addEventListener(`dragend`, (evt: any) => {
      evt.target.classList.remove(`selected`);
    });

    tasksListElement!.addEventListener(`dragover`, (evt: any) => {
      evt.preventDefault();

      const activeElement = tasksListElement!.querySelector(`.selected`);
      const currentElement = evt.target;
      const isMoveable = activeElement !== currentElement &&
        currentElement.classList.contains(`.backlog-card`);

      if (!isMoveable) {
        return;
      }

      const nextElement = (currentElement === activeElement!.nextElementSibling) ?
          currentElement.nextElementSibling :
          currentElement;

      tasksListElement!.insertBefore(activeElement!, nextElement);
    });

    const getNextElement = (cursorPosition: any, currentElement: any) => {
      const currentElementCoord = currentElement.getBoundingClientRect();
      const currentElementCenter = currentElementCoord.y + currentElementCoord.height / 2;

      const nextElement = (cursorPosition < currentElementCenter) ?
          currentElement :
          currentElement.nextElementSibling;

      return nextElement;
    };

    tasksListElement!.addEventListener(`dragover`, (evt: any) => {
      evt.preventDefault();

      const activeElement = tasksListElement!.querySelector(`.selected`);
      const currentElement = evt.target;
      const isMoveable = activeElement !== currentElement && currentElement!.classList.contains(`backlog-card`);

      if (!isMoveable) {
        return;
      }

      const nextElement = getNextElement(evt.clientY, currentElement);

      if (
        nextElement && 
        activeElement === nextElement.previousElementSibling ||
        activeElement === nextElement
      ) {
        return;
      }

      tasksListElement!.insertBefore(activeElement!, nextElement);
    });
  }

  backlogSearch() {
    if (this.searchField !== '') {

      this.filteredBacklog = this.backlog.filter((el: any) => el.subject.toLowerCase() == this.searchField.toLowerCase());

    } else {

      this.filteredBacklog = this.backlog;

    }
  }

}
</script>

<style scoped>

li {
  list-style: none;
}

ul {
  margin: 0;
  padding: 0;
}

.calendar-container {
  display: grid;
  grid-template-columns: 150px auto;
  grid-template-rows: auto;
  gap: 1px 1px;
  grid-template-areas: ". calendar-header" "timeslots-container main";
}

.daynumbers {
  display: grid;
  text-align: left;
  grid-template-columns: repeat(7, 1fr);
  min-height: 2em;
}

.daynumbers li {
  border: 2px solid #ccc;
  text-align: center;
  border-radius: 5px 5px 0 0;
}

.calendar-header {
  /* background-color: gray; */
  grid-area: calendar-header;
}

.timeslots-container {
  background-color: lightgray;
  grid-area: timeslots-container;
  justify-content: left;
}

.timeslots {
  min-width: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timeslots li {
  min-height: 100px;
  width: 100%;
  background-color: rgb(92, 184, 92);
  color: #fff;
  font-weight: 500;
  line-height: 100px;
}

.timeslots li::after {
  content: "";
  position: absolute;
  left: 10px;
  width: 65%;
  height: 1px;
  background-color: lightgray;
  z-index: 1;
}

.event-container {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(21, 1fr);
  grid-area: main;
  position: relative;
}

.event-slot {
  position: absolute;
  background-color: darkslategray;
  border-radius: 5px;
  z-index: 5;
  color: white;
  font-size: 12px;
  line-height: 33px;
}

.slot-1 {
  height: 33.3px;

  grid-row: 4;
  grid-column: 1;
}

.selected {
  opacity: 0.6;
}

.task-table {
  overflow-y: scroll;
  overflow-x: scroll;
  height:750px;
}

.backlog {
  overflow-y: scroll;
  max-height: 800px;
}

.bg-grey {
  background-color: lightgrey;
}

.color-blue {
  color: darkcyan;
}

.color-white {
  color: white;
}

.bg-green {
  background-color: green;
}

.div-table {
  display: table;             
  border: 1px solid #666666;         
  border-spacing: 5px; /* cellspacing:poor IE support for  this */
}
.div-table-row {
  display: table-row;
  width: auto;
  border: 1px solid #666666;
}
.div-table-col {
  float: left; /* fix for  buggy browsers */
  display: table-column;         
  width: 150px;
  height: 150px;
  line-height: 150px;
  border: 1px solid #666666;
}

@media (max-width: 1023px) {
  .backlog {
    display: none;
  }

  .div-table {
    width: 100% !important;
  }
  
  .timeslots li::after {
    content: "";
    position: absolute;
    left: 10px;
    width: 100%;
    height: 1px;
    background-color: lightgray;
    z-index: 1;
  }
}

</style>