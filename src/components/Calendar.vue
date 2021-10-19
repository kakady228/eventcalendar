<template>
  <div class="d-flex py-1">

    <div class="div-table col-sm-8">

      <div class="d-flex justify-content-between mb-3">
        <button @click="prevPage" :disabled="pageNumber == 0" class="btn btn-success">Prev</button>
        <button @click="addOneTestTask" class="btn btn-danger">Force Render</button>
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

        <div class="event-container" 
          @click="realtiveCoords"
          @drop="onDrop($event)"
          @dragenter.prevent
          @dragover.prevent>
            <div v-for="event in eventsOnaCalendar" :key="event.i" class="event-slot slot-1" :style="{ 'grid-column': event.weekDay, 'grid-row': event.executor }">
              <div :style="{ 'width': dayNumberWidth + 'px' }" class="event-status">{{ event.subject }}</div>
            </div>
        </div>

      </div>

    </div> 


    <!-- BACKLOG -->

    <div class="backlog col-sm-4 p-1 bg-grey sticky-top">
      <h1>Backlog</h1>
      <input 
        class="w-100" 
        @input="backlogSearch" 
        v-model="searchField" 
        type="search" 
        placeholder="Поиск">
      <div class="backlog-card-list">
        <div 
          v-for="task in filteredBacklog"
          :key="task.i" 
          @click="addTask(task)"
          draggable="true" 
          @dragstart="startDrag($event, task)" 
          title="Задержите мышь, и перетащите на поле календаря"
          class="backlog-card card my-1 text-start custom-title__2">

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

import Task from '@/Models/Task';
import User from '@/Models/User';
import DateList from '@/Models/DateList';
import { watchEffect } from '@vue/runtime-core';

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
      eventsOnaCalendar: [],
      dayNumberWidth: 112.23,
      row: 1,
      column: 1,
    }
  }

  users: User[] = [];
  tasks: Task[] = [];
  backlog: any[] = [];
  signedTasks: Task[] = [];
  filteredBacklog: Task[] = [];
  searchField: string = '';
  dayNumberWidth: number = 112.23;

  pageNumber: number = 0;
  listData: DateList[] = [
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
    { date: "2021-11-01" },
    { date: "2021-11-02" },
    { date: "2021-11-03" },
    { date: "2021-11-04" },
    { date: "2021-11-05" },
    { date: "2021-11-06" },
    { date: "2021-11-07" },
    { date: "2021-11-08" },
    { date: "2021-11-09" },
    { date: "2021-11-10" },
    { date: "2021-11-11" },
    { date: "2021-11-12" },
    { date: "2021-11-13" },
    { date: "2021-11-14" },
    { date: "2021-11-15" },
  ];
  size: number = 7;
  renderComponent: any;
  row: number = 1;
  column: number = 1;

  events: Task[] = [];
  eventsByDay: any = {};
  daysInaWeek: number = 7;
  sections: number = this.daysInaWeek;

  eventsOnaCalendar: Task[] = [];

// Created Hook
  created() {
    setInterval(() => {
      this.dayNumberWidth = document.querySelector('.daynumbers li')!.getBoundingClientRect().width;
    }, 100)

    watchEffect(() => this.dayNumberWidth);
    
    fetch('https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users')
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

        // this.signedTasks = this.tasks = this.tasks.filter((el: any) => {
        //   var signedTasks = [];
        //   if (el.executor) {
        //     el.executor*3;
        //     return signedTasks.push(el);
        //   }
        // })

        this.tasks.forEach((task: any) => {
          if (task.executor) {
            let executor = task.executor*3;
            task.executor = executor;
            this.signedTasks.push(task);
          }
        });
        console.log(this.signedTasks);
        for (let i = 0; i < this.paginatedData().length; i++) {
          const element = this.paginatedData()[i];
          this.signedTasks.forEach((event: any) => {
            if(event.planStartDate == element.date) {
              event["weekDay"] = i + 1;
              event["width"] = this.dayNumberWidth;
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

  addOneTestTask() {
    var task = this.backlog[9];

    for (let i = 0; i < this.paginatedData().length; i++) {
      const element = this.paginatedData()[i];
        task["weekDay"] = i + 1;
        task["executor"] = 1;
        task.planStartDate = '2021-11-04';
        this.signedTasks.push(task);
    }
    this.reRenderGrid();
  }

  addTask(task: any) {
    const event = task;
    for (let i = 0; i < this.paginatedData().length; i++) {
      const element = this.paginatedData()[i];
        event["weekDay"] = i + 1;
        event.executor = this.row;
        this.signedTasks.push(event);
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
        if(event.planStartDate == element.date) {
          event["weekDay"] = i + 1;
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
    var element = document.querySelector('.event-container');
    var bounds = element?.getBoundingClientRect();
    var x = event.clientX - bounds!.left;
    var y = event.clientY - bounds!.top;
    this.row = 1;
    this.column = 1;
    for (let i = 0; i < this.users.length*3; i++) {
      const element = this.users[i];
      if (i == 0 && y >= 0 && y <= 33.333) {
        this.row = 1;
      } else if (i == 1 && y >= 33.334 && y <= 66.666) {
        this.row = 2;
      } else if (i == 2 && y >= 66.667 && y <= 100) {
        this.row = 3;
      } else if (y >= (100/3 * i) + 1 && y <= 100/3 * (i + 1)) {
        this.row = i + 1;
      }
    }

    var container = document.querySelector('.event-container');
    this.dayNumberWidth = document.querySelector('.daynumbers li')!.getBoundingClientRect().width;

    for (let i = 0; i < 7; i++) {
      if (i == 0 && x >= 0 && x <= this.dayNumberWidth) {
        this.column = 1;
      } else if ( x >= (this.dayNumberWidth * i) + 1 && this.dayNumberWidth * (i + 1)) {
        this.column = i + 1;
      }
    }
    console.log('row: ', this.row, 'column: ', this.column);
  }

  // Mounted Hook
  mounted() {
    
  }

  startDrag(event: any, item: any) {
    console.log(item);
    event.dataTransfer.dropEffect = 'move';
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('itemID', item.id);
  }

  onDrop(event: any, list?: any) {
    const itemID = event.dataTransfer.getData('itemID');
    const item = this.backlog.find((item: any) => item.id == itemID);
    this.realtiveCoords(event);
    
    let weekDay = this.paginatedData()[this.column-1].date;
    console.log('weekDay: ', weekDay);
    item.planStartDate = weekDay;
    item["weekDay"] = this.column;
    item.executor = this.row - 3;
    this.signedTasks.push(item);
    
    this.reRenderGrid();

    this.addTask(item);

    const index = this.backlog.indexOf(item);
    console.log(index);
    if (index > -1) {
      this.backlog.splice(index, 1);
    }
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

  @import url('./Calendar.css');

</style>