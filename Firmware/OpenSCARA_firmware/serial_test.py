import serial

ser = serial.Serial('COM3', 115200);

ser.write("J1 180\n".encode("utf8"));

ser.close()