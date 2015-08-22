int DA = A0; // Pin for Analog Output - AO
int sensorvalue = 0;
 
void setup() {
  Serial.begin(9600);
}
 
void loop() {
  sensorvalue = analogRead(DA);  //Read the analog value
  Serial.print("S");
  Serial.println(sensorvalue);
}  
