import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

  private readonly cols = 10;
  private readonly rows = 20;
  private readonly campasWidth = 300;
  private readonly campasHeight = 600;
  private readonly blockWidth = this.campasWidth / this.cols;
  private readonly blockHeight = this.campasHeight / this.rows;

  private readonly shapes = [
    [1, 1, 1, 1],
    [1, 1, 1, 0,
      1],
    [1, 1, 1, 0,
      0, 0, 1],
    [1, 1, 0, 0,
      1, 1],
    [1, 1, 0, 0,
      0, 1, 1],
    [0, 1, 1, 0,
      1, 1],
    [0, 1, 0, 0,
      1, 1, 1]
  ];

  private subscription: Subscription;

  private board: number[][];
  private lose: boolean;
  private interval: any;
  private current: number[][];
  private currentX: number;
  private currentY: number;
  private context: CanvasRenderingContext2D;

  @ViewChild('canvas', {static: false}) canvas;

  constructor() { }

  ngAfterViewInit() {
    const canvas = this.canvas.nativeElement;
    this.context = canvas.getContext('2d');
    setInterval(() => this.render(), 30);
  }

  ngOnInit() {
    this.newGame();
    this.subscription = fromEvent(document, 'keydown').subscribe((e: KeyboardEvent) => {
      this.keyPress(e);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  keyPress(event: KeyboardEvent) {
    switch (event.code) {
      case 'ArrowLeft':
       if (this.isMobile(-1)) {
         this.currentX -= 1;
         this.render();
       }
       break;
      case 'ArrowRight':
        if (this.isMobile(1)) {
          this.currentX += 1;
          this.render();
        }
        break;
      case 'ArrowDown':
         if (this.isMobile(0, 1)) {
           this.currentY += 1;
           this.render();
         }
         break;
      case 'Space':
        const rotated = this.rotate(this.current);
        if (this.isMobile(0, 0, rotated)) {
          this.current = rotated;
          this.render();
         }
        break;
      default:
        break;
    }
  }

  rotate(current: number[][]) {
    const newCurrent = [];
    for (let y = 0; y < 4; y += 1) {
      newCurrent[y] = [];
      for (let x = 0; x < 4; x += 1) {
        newCurrent[y][x] = current[3 - x][y];
      }
    }
    return newCurrent;
  }

  newGame() {
    clearInterval(this.interval);
    this.init();
    this.newShape();
    this.lose = false;
    this.interval = setInterval(() => this.tick(), 250);
  }

  init() {
    this.board = Array.from(new Array(20), () => new Array(10).fill(0));
  }

  newShape() {
    const id = Math.floor(Math.random() * this.shapes.length);
    const shape = this.shapes[id];
    this.current = [];

    for (let y = 0; y < 4; y += 1) {
      this.current[y] = [];
      for (let x = 0; x < 4; x += 1) {
        const i = 4 * y + x;
        if (typeof shape[i] !== 'undefined' && shape[i]) {
          this.current[y][x] = id + 1;
        } else {
          this.current[y][x] = 0;
        }
      }
    }
    this.currentX = 5;
    this.currentY = 0;
  }

  isMobile(offsetX = 0, offsetY = 0, newCurrent = this.current): boolean {
    offsetX = this.currentX + offsetX;
    offsetY = this.currentY + offsetY;
    for (let y = 0; y < 4; y += 1) {
      for (let x = 0; x < 4; x += 1) {
        if (newCurrent[y][x]) {
         if (typeof this.board[y + offsetY] === 'undefined'
            || typeof this.board[y + offsetY][x + offsetX] === 'undefined'
            || this.board[y + offsetY][x + offsetX]
            || x + offsetX < 0
            || y + offsetY >= this.rows
            || x + offsetX >= this.cols) {
              if (offsetY === 1
                  && (offsetX - this.currentX) === 0
                  && (offsetY - this.currentY) === 1
                  ) {
                    console.log('game over');
                    this.lose = true;
                  }
              return false;
            }
        }
      }
    }
    return true;
  }

  tick() {
    if (this.isMobile(0, 1)) {
      this.currentY += 1;
    } else {
      this.freeze();
      this.clearLines();
      if (this.lose) {
        this.newGame();
        return false;
      }
      this.newShape();
    }
  }

  render() {
    if (this.context) {
      this.context.clearRect(0, 0, this.campasWidth, this.campasHeight);
      this.context.strokeStyle = 'grey';

      for (let x = 0; x < this.cols; x += 1) {
        for (let y = 0; y < this.rows; y += 1) {
          if (this.board[y][x]) {
            this.context.fillStyle = 'white';
            this.drawBlock(x, y);
          }
        }
      }

      for (let y = 0; y < 4; y += 1) {
        for (let x = 0; x < 4; x += 1) {
          if (this.current[y][x]) {
            this.context.fillStyle = 'white';
            this.drawBlock(this.currentX + x, this.currentY + y);
          }
        }
      }
    }
  }

  drawBlock(x: number, y: number) {
    this.context.fillRect(this.blockWidth * x,
                          this.blockHeight * y,
                          this.blockWidth - 1,
                          this.blockHeight - 1);

    this.context.strokeRect(this.blockWidth * x,
                            this.blockHeight * y,
                            this.blockWidth - 1,
                            this.blockHeight - 1);
  }

  freeze() {
    for (let y = 0; y < 4; y += 1) {
      for (let x = 0; x < 4; x += 1) {
        if (this.current[y][x]) {
          this.board[y + this.currentY][x + this.currentX] = this.current[y][x];
        }
      }
    }
  }

  clearLines() {
    for (let y = this.rows - 1; y >= 0; y -= 1) {
      let rowFilled = true;
      for (let x = 0; x < this.cols; x += 1) {
        if (this.board[y][x] === 0) {
          rowFilled = false;
          break;
        }
      }

      if (rowFilled) {
        for (let yy = y; yy > 0; yy -= 1) {
          for (let x = 0; x < this.cols; x += 1) {
            this.board[yy][x] = this.board[yy - 1][x];
          }
        }
        y += 1;
      }
    }
  }

}
