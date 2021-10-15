<template>
  <div class="d-flex py-1">

    <div class="div-table col-sm-8">
      <!-- <FullCalendar class="col-sm-12" :options="calendarOptions"></FullCalendar> -->

      <div class="calendar-container">
        
        <div class="calendar-header">
          <ul class="weekdays">
            <li>Sunday</li>
            <li>Monday</li>
            <li>Tuesday</li>
            <li>Wednesday</li>
            <li>Thursday</li>
            <li>Friday</li>
            <li>Saturday</li>
          </ul>

          <ul class="daynumbers">
            <li>20</li>
            <li>21</li>
            <li>22</li>
            <li>23</li>
            <li>24</li>
            <li>25</li>
            <li>26</li>
          </ul>
        </div>

        <div class="timeslots-container">
          <ul class="timeslots">
            <li>9<sup>am</sup></li>
            <li>10<sup>am</sup></li>
            <li>11<sup>am</sup></li>
            <li>12<sup>am</sup></li>
            <li>1<sup>pm</sup></li>
            <li>2<sup>pm</sup></li>
            <li>3<sup>pm</sup></li>
            <li>4<sup>pm</sup></li>
            <li>5<sup>pm</sup></li>
          </ul>
        </div>

        <div class="event-container">
          <div class="slot slot-1">
            <div class="event-status"></div>
            <span>Event A</span>
          </div>
        </div>

      </div>

    </div> 


    <!-- BACKLOG -->

    <div class="backlog col-sm-4 p-1 bg-grey">
      <h1>Backlog</h1>
      <input class="w-100" @input="backlogSearch" v-model="searchField" type="search" placeholder="Поиск">
      <div class="backlog-card-list">
        <div class="backlog-card card my-1 text-start" v-for="task in filteredBacklog" :key="task.i" draggable="true">
          <div class="card-header color-blue fw-bold">
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

import '@fullcalendar/core';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import Task from '@/Models/Task';
import User from '@/Models/User';

@Options({
  props: {
    msg: String
  },
  components: {
    FullCalendar
  }
})
export default class Calendar extends Vue {
  data() {
    return{
      calendarOptions: {
        plugins: [ dayGridPlugin, interactionPlugin ],
        initialView: 'dayGrid',
        dateClick: this.handleDateClick,
        events: [
          { title: 'event 1', date: '2021-10-15' },
          { title: 'event 2', date: '2021-10-16' }
        ],
        duration: { days: 7 },
      },
      users: [],
      tasks: [],
      timeDate: Date(),
      backlog: [],
    }
  }

  users: User[] = [];
  tasks: Task[] = [];
  backlog: Task[] = [];
  signedTasks: Task[] = [];
  filteredBacklog: Task[] = [];
  timeDate: Date = new Date();
  searchField: string = '';



  handleDateClick(arg: any) {
    alert('date click! ' + arg.dateStr);
  }

  created() {

    fetch('https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users')
      .then(response => response.json())
      .then(data => {
        this.users = data;
        console.log(this.users[0]);
      })

    fetch('https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks')
      .then(response => response.json())
      .then(data => {
        this.tasks = data;
        
        console.log(this.tasks[0]);

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

  daysInMounth(year: number, month: number) {
    return new Date(year, month, 0).getDate();
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
  grid-template-columns: 50px auto;
  grid-template-rows: auto;
  gap: 1px 1px;
  grid-template-areas: ". calendar-header" "timeslots-container main";
}

.weekdays,
.daynumbers {
  display: grid;
  text-align: left;
  padding: 5px;
  grid-template-columns: repeat(7, 1fr);
}

.daynumbers {
  min-height: 2em;
}

.weekdays {
  background-color: lightblue;

}

.calendar-header {
  background-color: gray;
  grid-area: calendar-header;
}

.timeslots-container {
  background-color: lightgray;
  grid-area: timeslots-container;
  justify-content: left;
}

.timeslots {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timeslots li {
  min-height: 60px;
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
  grid-template-rows: repeat(18, 1fr);
  grid-area: main;
  position: relative;
}

.slot {
  position: absolute;
  background-color: darkslategray;
  border-radius: 5px;
  z-index: 5;
  color: white;
  font-size: 12px; 
}

.slot-1 {
  height: 30px;

  grid-row: 1;
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
  height: 800px;
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

</style>
