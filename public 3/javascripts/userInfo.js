async function init(){
    await loadIdentity();
    loadUserInfo();
}


async function loadUserInfo(){
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user');
    if(username==myIdentity){
        document.getElementById("username-span").innerText= `You (${username})`;
    }else{
        document.getElementById("username-span").innerText=username;
    }
    
    loadUserInfoPosts(username)
}


async function loadUserInfoPosts(username){
    let postsJson = await fetchJSON(`api/${apiVersion}/posts?username=${encodeURIComponent(username)}`);
    postsHtml = createPostsHtml(postsJson)
    document.getElementById("posts_box").innerHTML = postsHtml;
}
