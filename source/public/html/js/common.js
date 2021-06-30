function closepop(t){
	var t = t;
	$(".bg-alpha").css("z-index","80");
	$(t).hide();
}

function subpopOpen(t){
	var t = t;
	$(".bg-alpha").css("z-index","91");
	$(t).show();
}

$(document).ready(function(){

	$(".btn-add-subt.auto-subt").hover(function(){
		$(".auto-subt-info").fadeIn();
	},function(){
		$(".auto-subt-info").fadeOut();
	});

	/* 우측 하단 줌 버튼 클릭시 */
	var z = 2;

	$(".btn-zoom").click(function(){
		if ($(this).hasClass("zoom-in") && z<4)
		{	
			z+=1;
			$(".zoom-control-bar").attr("name","zoom-"+z);
		}
		else if ($(this).hasClass("zoom-out") && z>0)
		{
			z-=1;
			$(".zoom-control-bar").attr("name","zoom-"+z);
		}
	});
	/* 우측 하단 줌 버튼 클릭시 end */


	$(".btn-editor-top-more").click(function(){
			if ($(this).hasClass("on"))
			{
				$(this).removeClass("on");
				$(".editor-top-more-wrap").hide();
			}else{
				$(this).addClass("on");
				$(".editor-top-more-wrap").show();
			}
		});
	

	$(".btn-more-option").click(function(){
		$(".btn-editor-top-more").removeClass("on");
		$(".editor-top-more-wrap").hide();
	});


	$(".editor-input-text").focus(function(){
		$(".editor-row").removeClass("now");
		$(this).parent().parent(".editor-row").addClass("now");
	});

	$(".editor-time-stamp").focus(function(){
		$(".editor-row").removeClass("now");
		$(this).parent().parent().parent(".editor-row").addClass("now");
	});

	$(".editor-input-text").blur(function(){
		$(".editor-row").removeClass("now");
	});
	$(".editor-time-stamp").blur(function(){
		$(".editor-row").removeClass("now");
	});

	$(".subt-txt").click(function(){
		$(".subt-txt").removeClass("active");
		$(this).addClass("active");
	});

});