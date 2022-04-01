
const Gpio = require('pigpio').Gpio;
const request = require('request');
const sleep = delayMs => new Promise(resolve => setTimeout(resolve, delayMs))

// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const MICROSECDONDS_PER_CM = 1e6/34321;

const trigger = new Gpio(23, {mode: Gpio.OUTPUT, alert: true});
const echo = new Gpio(24, {mode: Gpio.INPUT, alert: true});
const min_angle = -90
const min_usec = 500

const max_angle = 90
const max_usec = 2500

const motor = new Gpio(10, {mode: Gpio.OUTPUT});
trigger.digitalWrite(0); // Make sure trigger is low

const watchHCSR04 = () => {
  let startTick;

   echo.on('alert', (level, tick) => {
    if (level == 1) {
      startTick = tick;
    } else {
      const endTick = tick;
      const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
      
      const sendmsg = (diff / 2 / MICROSECDONDS_PER_CM);
      if(sendmsg<=15){
        console.log("motor trigerred");
        
        run();

         
    }    
  
    // Send message to server to start motor if proximity value is less then 0.15      
      console.log(diff / 2 / MICROSECDONDS_PER_CM);
    }
  });
  async function run() {
    await setAngle(min_angle) 
    await sleep(8000)
    await setAngle(0) 
  };

  async function setAngle(angle) {
    const duty_usec = Math.floor(((angle - min_angle) / (max_angle - min_angle)) * (max_usec - min_usec) + min_usec)
    //console.log(`SERVO: ${angle} duty_usec=${duty_usec}`)
    motor.servoWrite(duty_usec);
  };  

};

watchHCSR04();

// Trigger a distance measurement once per second
setInterval(() => {
  trigger.trigger(10, 1); // Set trigger high for 10 microseconds
}, 1000);
