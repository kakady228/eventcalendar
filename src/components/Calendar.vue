<template>
  <div class="d-flex py-1">

    <div class="div-table col-sm-8">

      <div class="d-flex justify-content-between mb-3">
        <button @click="prevPage" :disabled="pageNumber == 0" class="btn btn-success">Prev</button>
        <button @click="forceRender" class="btn btn-danger">Force Render</button>
        <button @click="nextPage" :disabled="pageNumber >= pageCount()-1" class="btn btn-success">Next</button>
      </div>

      <!-- CALENDAR CONTAINER -->

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

        <div class="event-container" @click="realtiveCoords">
            <div v-for="event in eventsOnaCalendar" :key="event.i" class="event-slot slot-1" :style="{ 'grid-column': event.weekDay, 'grid-row': (1 + (event.executor * 3)) }">
              <div class="event-status" :title="event.subject">{{ event.planStartDate + event.subject }}</div>
              <!-- <span>{{ event.subject }}</span> -->
            </div>
          <div class="event-slot slot-1">
            <div class="event-status"></div>
            <span>Event A</span>
          </div>
        </div>

      </div>

    </div> 


    <!-- BACKLOG -->

    <div class="backlog col-sm-4 p-1 bg-grey sticky-top">
      <h1>Backlog</h1>
      <input class="w-100" @input="backlogSearch" v-model="searchField" type="search" placeholder="Поиск">
      <div class="backlog-card-list">
        <div class="backlog-card card my-1 text-start" v-for="task in filteredBacklog" :key="task.i" draggable="true">
          <div @click="addTask(task)" class="card-header color-blue fw-bold">
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
        required: true
      },
      size: {
        type:Number,
        required:false,
        default: 7
      },
      superevent: [],
      eventsOnaCalendar: []
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

  eventsOnaCalendar: any[] = [];

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

        for (let i = 0; i < this.paginatedData().length; i++) {
          const element = this.paginatedData()[i];
          this.signedTasks.forEach((event: any) => {
            if(event.planStartDate == element.date) {
              event["weekDay"] = i + 1;
              this.eventsOnaCalendar = [];
              this.eventsOnaCalendar.push(event);
            }
          });
        }
        this.filteredBacklog = this.backlog;

      })
      
  }
  forceRender() {
    this.$forceUpdate;
  }

  addTask(task: any) {
    const event = task;
    for (let i = 0; i < this.paginatedData().length; i++) {
      const element = this.paginatedData()[i];
      if(event.planStartDate == element.date) {
        event["weekDay"] = i + 1;
        event.executor = 0;
        this.eventsOnaCalendar = [];
        this.eventsOnaCalendar.push(event);
        console.log(this.events);
      }
    }
    this.reRenderGrid();
  }

// PAGINATION
  nextPage() {
    this.pageNumber++;
    this.reRenderGrid();
  }

  prevPage() {
    this.pageNumber--;
    this.reRenderGrid();
  }

  clearArray(array: any) {
    array;
    return array = [];
  }

  reRenderGrid() {
    this.eventsOnaCalendar = this.clearArray(this.signedTasks);
    for (let i = 0; i < this.paginatedData().length; i++) {
      const element = this.paginatedData()[i];
      this.signedTasks.forEach((event: any) => {
        console.log('SADSAJHDSALHBDSAKJD');
        if(event.planStartDate == element.date) {
          event["weekDay"] = i + 1;
          this.eventsOnaCalendar = [];
          this.eventsOnaCalendar.push(event);
        }
      });
    }
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

  realtiveCoords(event: any) {
    console.log("event: ", event)
    var element = document.querySelector('.event-container');
    var bounds = element?.getBoundingClientRect();
      var x = event.clientX - bounds!.left;
      var y = event.clientY - bounds!.top;
      var row = 1;
      var column = 1;
      for (let i = 0; i < this.users.length; i++) {
        const element = this.users[i];
        if (i == 0 && y >= 0 && y <= 100) {
          row = 1;
        } else if (y >= (100 * i) + 1 && y <= 100 * (i + 1)) {
          row = i + 1;
        }
      }
      console.log('eventX: ', x, 'eventY: ', y);
      console.log('row: ', row, 'column: ', column);
  }

  // Mounted Hook
  mounted() {
    setTimeout(() => {
      var container = document.querySelector('.event-container');
      console.log(
        'div width: ', container!.getBoundingClientRect().width,
        'div height: ', container!.getBoundingClientRect().height,
      );
    }, 3000);
    
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
  height: 100px;
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
  
  grid-area: 16 / 6 / auto / auto;
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