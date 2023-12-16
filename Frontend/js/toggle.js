const hamburgerMenu = document.getElementById('mobile-view');
const closeBtn = document.querySelector('.close-btn');
const verticalNav = document.getElementById('vertical-nav');
const leftList = document.querySelector('.left-list');
const rightList = document.querySelector('.right-list');

// To expand the mobile navbar
hamburgerMenu.addEventListener('click', () => {
    setTimeout(() => {
        closeBtn.style.display = 'block';
        hamburgerMenu.style.display = 'none';
        verticalNav.style.display = 'block';
        verticalNav.style.backgroundColor = 'rgb(33,37,41)';

        leftList.style.display = 'block';
        for(let i = 0; i < leftList.children.length; i++){
            leftList.children[i].style.textAlign = 'center';
        }

        rightList.style.display = 'block';
        for(let i = 0; i < rightList.children.length; i++){
            rightList.children[i].style.textAlign = 'center';
        }
        verticalNav.appendChild(leftList);
        verticalNav.appendChild(rightList);
    }, 100)
})

// To close the mobile navbar
closeBtn.addEventListener('click', () => { 
    setTimeout(() => {
        verticalNav.style.display = 'none';
        hamburgerMenu.style.display = 'block';
        closeBtn.style.display = 'none';
    }, 200);
})