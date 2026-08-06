interface Worker {
  work(): void;
  eat(): void;
}

interface Workable {
  work(): void;
}

interface Eatable {
  eat(): void;
}

class Employee implements Workable, Eatable {
  work() {}
  eat() {}
}

class Robot implements Workable {
  work() {}
}