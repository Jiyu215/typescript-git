let 이름:string = "Kim"; //string만 넣을 수 있음
let bookName:string[] = ['a','b']; //array 자료형 : string 만 담을 수 있음
let student :{name:string, grade:number} = {name:'kim', grade:80}; //object 자료형 : string과 number을 담을 수 있음
let studentName :{name?:string} = {}; //name 속성은 옵션 -> 들어올수있고 없을수도있음

//예제
type Mytypetest = string | number; //타입을 변수에 담아서 사용할 수 있음
let numValule:Mytypetest = '20'; //Union type -> string 또는 number가 들어옴

function 함수(x:number) :number{ //number 타입이 return을 하도록 지정 : 파라미터값 -> number, return 값 -> number
    return x*2;
}

//array 에 쓸수있는 tuple(튜플) 타입
type Member = [number,boolean] //첫번째[0] -> number , 두번째[1] -> boolean
let john:Member = [1,true]

//object 자료형 예시
type UserName = {
    name:string
}
let Kim:UserName = {name:'suo'} //string타입의 name만 넣을 수 있음

//타입을 지정해야할 속성이 많을 경우
type AllString = {
    [key:string]: string; //문자로된 모든 object타입은 : string을 사용
}
let Seo:AllString = {name:'kim',age:'20'}
