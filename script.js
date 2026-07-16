const lines=document.querySelectorAll('.story-lines p');
const lineObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('on')}),{threshold:.68});
lines.forEach(line=>lineObserver.observe(line));

const revealItems=document.querySelectorAll('.reveal');
const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}}),{threshold:.12});
revealItems.forEach(item=>revealObserver.observe(item));

const book=document.querySelector('#bookImage');
if(book){
  book.parentElement.addEventListener('mousemove',event=>{
    const rect=book.parentElement.getBoundingClientRect();
    const x=(event.clientX-rect.left)/rect.width-.5;
    const y=(event.clientY-rect.top)/rect.height-.5;
    book.style.transform=`rotateY(${x*14-6}deg) rotateX(${y*-8}deg)`;
  });
  book.parentElement.addEventListener('mouseleave',()=>book.style.transform='rotateY(-7deg)');
}

const quotes=[
  '기본은 당연해서 잊고,\n결과는 눈에 보여서 쫓습니다.',
  '익숙함은 기본을 당연하게 만들고,\n당연함은 본질을 잊게 만듭니다.',
  '기본은 결과를 빨리 만들지 않아도,\n결과를 오래가게 만듭니다.',
  '본질은 잊기 쉬워서,\n계속 돌아봐야 합니다.'
];
let quoteIndex=0;
const quote=document.querySelector('#quote');
const nextQuote=document.querySelector('#nextQuote');
if(nextQuote){
  nextQuote.addEventListener('click',()=>{
    quoteIndex=(quoteIndex+1)%quotes.length;
    quote.animate([{opacity:1},{opacity:0},{opacity:1}],{duration:520,easing:'ease'});
    quote.innerHTML=quotes[quoteIndex].replace('\n','<br>');
  });
}
