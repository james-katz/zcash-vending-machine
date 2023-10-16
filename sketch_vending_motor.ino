const byte DATA_MAX_SIZE = 32;
char data[DATA_MAX_SIZE];   // an array to store the received data

const int relay_1 = 7;
const int relay_2 = 6;
const int sensor = 0;

unsigned long prevRot = 0;

void setup() {
  Serial.begin(9600);

  digitalWrite(relay_1, HIGH);
  digitalWrite(relay_2, HIGH);
  pinMode(relay_1, OUTPUT);
  pinMode(relay_2, OUTPUT);

  pinMode(sensor, INPUT);

  // Wait for a sec before entering the main loop
  delay(1000);
  // startMotor(1,2);
}

void loop() {
  receiveData();
}

void startMotor(int id, int revs) {
  int relay = id == 1 ? relay_1 : relay_2;

  digitalWrite(relay, LOW);
  bool rotating = true;

  String msg = "Motor " + String(id) + " on";
  Serial.println(msg);

  prevRot = millis();
  int count = 0;

  while(rotating) {        
    long currRot = millis(); 
    if(analogRead(sensor) < 100 && (currRot - prevRot > 800)) {
      count ++;
      if(count >= revs) {            
        rotating = false;          
        digitalWrite(relay, HIGH);

        String msg = "Motor " + String(id) + " off";
        Serial.println(msg);
      }
      prevRot = millis();          
    }
  } 
}

void receiveData() {
  String receivedStr;     // read char from serial port
  if(Serial.available() > 0) {
    receivedStr = Serial.readStringUntil("\n");
    Serial.println(receivedStr);

    if(receivedStr) {
      int motor_id = receivedStr.substring(1).toInt();
      int revolutions = receivedStr.substring(3).toInt();
      startMotor(motor_id, revolutions);      
    }
    else {
      Serial.println("Invalid command");
    }
  }
}
