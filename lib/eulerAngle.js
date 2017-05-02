class EulerAngle {
    constructor(x, y, z, w){
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;

        this.pitch = this.setPitch();
        this.roll = this.setRoll();
        this.yaw = this.setYaw();
    }

    getAngles(){
        return {
            pitch: this.pitch,
            yaw: this.yaw,
            roll: this.roll
        }
    }

    setPitch(){
        return Math.asin(2.0 * (this.w * this.y - this.z * this.x));
    }

    setYaw(){
       return Math.atan2(2.0 * (this.w * this.z + this.x * this.y),
            1.0 - 2.0 * (this.y * this.y + this.z * this.z));
    }

    setRoll(){
       return Math.atan2(2.0 * (this.w * this.x + this.y * this.z),
            1.0 - 2.0 * (this.x * this.x + this.y * this.y));
    }
}
