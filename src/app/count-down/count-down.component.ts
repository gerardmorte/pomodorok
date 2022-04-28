import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { FormComponent } from '../form/form.component';

@Component({
  selector: 'app-count-down',
  templateUrl: './count-down.component.html',
  styleUrls: ['./count-down.component.css'],
})

export class CountDownComponent implements OnInit {
  @ViewChild('reloj') date: ElementRef;
  @ViewChild('start') buttonStart: ElementRef;
  @ViewChild('pause') buttonPause: ElementRef;
  @ViewChild('next') buttonNext: ElementRef;
  @ViewChild('stop') buttonStop: ElementRef;

  //ELEMENTS FROM FORM COMPONENT
  @ViewChild(FormComponent) inputElement: { inputTask: ElementRef };
  @ViewChild(FormComponent) saveElement: { saveTask: ElementRef };
  @ViewChild(FormComponent) editElement: { editTask: ElementRef };

  //VARIABLES ADMINISTRAR COUNTDOWN()
  contador: any;
  setMinutes: number;
  setSeconds: number;
  initialMinutes: number;
  initialSeconds: number;
  minutes: number;
  seconds: number;
  textMinutes: string;
  textSeconds: string;
  //
  break: boolean = false;
  contadorBreaks: number = 0;
  contadorFocus: number = 1;
  firstStart: boolean;
  static auxFirstStart: string = "";

  //Variables para contar el tiempo de bloque
  totalMin: number = 0;
  totalSec: number = 0;
  auxTotalMin: number = this.totalMin;
  auxTotalSec: number = this.totalSec;

  //ARRAY A ENVIAR A STATISTICS
  tiempoBloque: string = "";
  tareaBloque: string = "";
  estadisticasArray: any = [];

  //ARRAY SETTINGS REBRE DADES
  settingsArray: any = [];

  //VISTA RELOJ CONTROLADOR
  firstTimer: boolean = true;

  //PRUEBA SUMAR TIEMPOS:
  sumaMinutos: number = 0;
  sumaSegundos: number = 0;
  auxSumaSegundos: number = 0;

  ngOnInit(): void {
    this.getEstadisticas();
    this.getSettings();
  }

  ngAfterViewInit() {
    this.buttonPause.nativeElement.disabled = true;
    this.buttonNext.nativeElement.disabled = true;
    this.buttonStop.nativeElement.disabled = true;
  }

  updateTime(i: string) {
    if (Number(i) < 10) {
      i = '0' + i;
    }
    return i;
  }

  countDown(min: number, sec: number) {
    this.initialMinutes = min;
    this.initialSeconds = sec;
    this.minutes = this.initialMinutes;
    this.seconds = this.initialSeconds;

    this.contador = setInterval(() => {
      let reloj = new Date();
      reloj.setMinutes(this.minutes);
      reloj.setSeconds(this.seconds);

      this.textMinutes = String(reloj.getMinutes());
      this.textSeconds = String(reloj.getSeconds());

      this.textMinutes = this.updateTime(this.textMinutes);
      this.textSeconds = this.updateTime(this.textSeconds);
      this.date.nativeElement.innerHTML = this.textMinutes + ':' + this.textSeconds;

      if (this.textMinutes == "00" && this.textSeconds == "00") {
        this.playSound();
        this.nextCountDown();
      }

      this.seconds--;

      if (this.seconds == -60) {
        this.sumaMinutos++;
      }

      this.sumaSegundos = Math.abs(this.seconds) - 1;

    }, 1000);

  }

  pauseCountDown(timer: any) {
    clearInterval(timer);
    this.buttonStart.nativeElement.disabled = false;
    this.editElement.editTask.nativeElement.disabled = false;
  }

  restartCountDown() {
    this.countDown(this.minutes, this.seconds);
  }

  btnStart(min: number, sec: number) {
    this.editElement.editTask.nativeElement.disabled = true;
    this.saveElement.saveTask.nativeElement.disabled = true;
    this.inputElement.inputTask.nativeElement.disabled = true;

    if (!this.firstStart) {
      this.buttonPause.nativeElement.disabled = false;
      this.buttonNext.nativeElement.disabled = false;
      this.buttonStop.nativeElement.disabled = false;
      this.firstStart = true;
    }

    if (this.minutes == this.initialMinutes && this.seconds == this.initialSeconds) {
      this.countDown(min, sec);
      this.buttonStart.nativeElement.disabled = true;

    } else {
      this.restartCountDown();
      this.buttonStart.nativeElement.disabled = true;
    }

    CountDownComponent.auxFirstStart = "disabled";

  }

  nextCountDown() {
    this.auxSumaSegundos += this.sumaSegundos;

    clearInterval(this.contador);

    if (this.contadorBreaks == 3 && !this.break) {
      this.longBreak(this.settingsArray[2], 0);
    } else if (!this.break) {
      this.shortBreak(this.settingsArray[1], 0);
    } else {
      this.focusTime(this.settingsArray[0], 0);
    }
  }

  focusTime(min: number, sec: number) {
    this.setMinutes = min;
    this.setSeconds = sec;
    this.countDown(this.setMinutes, this.setSeconds);
    this.break = false;

    if(this.contadorFocus == 4){
      this.contadorFocus = 1;
    }else{
    this.contadorFocus++;
    }
  }

  shortBreak(min: number, sec: number) {
    this.setMinutes = min;
    this.setSeconds = sec;
    this.countDown(this.setMinutes, this.setSeconds);
    this.break = true;
    this.contadorBreaks++;
  }

  longBreak(min: number, sec: number) {
    this.setMinutes = min;
    this.setSeconds = sec;
    this.countDown(this.setMinutes, this.setSeconds);
    this.break = true;
    this.contadorBreaks = 0;
  }

  playSound() {
    let audio = new Audio();
    audio.src = ".//src/assets/audio/notification.wav";
    audio.load();
    audio.play();
  }

  stopPomodoro() {

    CountDownComponent.auxFirstStart = "";

    this.pauseCountDown(this.contador);

    this.contadorBreaks = 0;
    this.contadorFocus = 0;
    this.auxSumaSegundos += this.sumaSegundos;

    //GUARDAR TEMPS TOTAL DEL BLOC
    let taskDay = new Date();
    let ajustarSegundos = this.auxSumaSegundos - (this.sumaMinutos * 60);
    this.tiempoBloque = this.updateTime(String(this.sumaMinutos)) + ":" + this.updateTime(String(ajustarSegundos));
    this.tareaBloque = taskDay.getDate() + "-" + this.updateTime(String(taskDay.getMonth() + 1)) + " / " + this.inputElement.inputTask.nativeElement.value;

    //NETEJAR TEMPS TOTAL DEL BLOC I TEXT FORMULARI.
    this.totalMin, this.totalSec, this.auxTotalMin, this.auxTotalSec = 0;
    this.inputElement.inputTask.nativeElement.value = "";

    //GUARDAR DADES AL ARRAY (AFEGIR ID??? PER BORRAR REGISTRES...? O FER-HO PER TRIATGE OBTENIT EL VALUE)
    let elem = { tiempoBloque: this.tiempoBloque, tareaBloque: this.tareaBloque };
    this.estadisticasArray.push(elem);
    this.localStorageEstadisticas(this.estadisticasArray);

    //REINICIAR COUNTDOWN Y BUTTONS ESTIL D'INICI
    this.focusTime(this.settingsArray[0], 0);
    this.pauseCountDown(this.contador);
    this.buttonPause.nativeElement.disabled = true;
    this.buttonNext.nativeElement.disabled = true;
    this.buttonStop.nativeElement.disabled = true;
    this.inputElement.inputTask.nativeElement.disabled = false;
    this.saveElement.saveTask.nativeElement.disabled = false;
    this.firstStart = false;

    //PLAYSOUND
    this.playSound();
  }

  //METODO GUARDAR DATOS EN LOCAL STORAGE
  localStorageEstadisticas(array: any) {
    localStorage.setItem("localEstadisticas", JSON.stringify(array));
  }

  //OBTENER DATOS ESTADISTICAS LOCAL STORAGE PARA RELLENAR ARRAY CON NUEVAS TASK
  getEstadisticas() {
    var storedList = localStorage.getItem("localEstadisticas");
    if (storedList == null) {
      let storedList = [];
    } else {
      this.estadisticasArray = JSON.parse(storedList);
    }
    return this.estadisticasArray;
  }

  //OBTENER DATOS SETTINGS LOCAL STORAGE
  getSettings() {
    var storedList = localStorage.getItem("localSettings");
    if (storedList == null) {
      let storedList = [];
    } else {
      this.settingsArray = JSON.parse(storedList);
    }
    return this.settingsArray;
  }

}

export const observable = new Observable(Subscriber => {
  setInterval(function(){
    Subscriber.next(CountDownComponent.auxFirstStart);

  },1000);
})
