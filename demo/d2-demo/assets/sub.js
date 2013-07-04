/**
 * ��èר�����ն�
 *
 * @author luics (guidao)
 * @version 1.0.0
 * @date 5/26/13 3:00 PM
 */
var __IMPORT = [
    'xtemplate',
    'flipsnap',
    'hammer',
	'cookie',
    'tmallpromotion/util'
].join(',');

KISSY.use(__IMPORT, function(S, Xtpl, Flipsnap, Hammer, Cookie, U) {
    S.Config.debug = true;
	
    var inited = false;//ȫ�ֱ�������
	
	//ȫ�ֻ����������趨
	var phoneGlobal = {
		width:320,
		listId:1,
		goTheWay:true, //true ��ʾ������
		height:window.innerHeight,
		transformMark:false, //����Сè��С״̬��λ�� false �ܴ����ǹرյ�״̬
		toggleNavMark:false //�������浼���������� true��ʾ����״̬
	}

    function init() {
        //var qs = U.unparam(location.href);
		qs = getListId();
        go(qs ? qs : 1);
    }
	
	//��hash����ȡlistId
	function getListId(){
		var _listId = (location.hash.split('/')[0].split('!')[1])*1;
		
		_listId = _listId?_listId:1;
		
		_listId = U.unparam(location.href) && U.unparam(location.href).id || _listId;
		
		return _listId;
	}
	
	//��hash����ȡitemId
	function getItemId(){
		var _itemId = (location.hash.split('/')[1])*1;
		
		_itemId = _itemId?_itemId:0;
		
		return _itemId;
	}

    function go(id) {
        S.ajax({
            type: 'get',
            dataType: 'json',
            url: 'data/sub.php',
            timeout: 3,
            data: {
                id: id
            },
            success: function(data) {
                if (!data.success) {
                    return;
                }

                var model = data.model;
                U.log('sub subcess', model);

                var platform = U.platform;
                var isPhone = platform.iphone || platform.android;
                var isPhone = true;
                if (isPhone) {
                    renderPhone(model);
					//TODO:���һ���������resize()��PC��Ⱦ����Ҫ������ʾ����ʽʹ�õĻ��޳�֮
					renderPc(model);
					resizePhone();
                } else {
                    renderPc(model);
                }
            },
            error: function(textStatus) {
                U.log(textStatus);
            }
        });
    }
	

    /**
     * �ֻ����湹��
     *
     * @param {Object} model
     * @param {Object} model.list
     * @param {Array} model.list.data
     */
    function renderPhone(model) {
		
		//��ں���
		function phoneInit(){
			
			//DOM�ṹ����
			domRender();
			
			//ͨ���¼���
			activeBind();
			
			//���Ժ���
			review();
			
			//�ж��Ƿ񱻼��ع�
			inited = true;
		}
		
		var ROOT_TPL = new Xtpl([
			'<div id="J_PhoneContent" class="phone-content">',
			'  <div id="J_PhoneDetail" class="phone-detail"></div>',
			'  <ul id="J_PhoneList" class="phone-list"><li class="list-more" id="J_ListMore">����</li></ul>',
			'  <div id="J_Guide" class="guide"></div>',
			'  <div class="subject-loading" id="J_LadingBox">',
			'    <div class="subject-loading-bg"></div>' ,
			'    <div class="subject-loading-content">' ,
			'      <div class="subject-loading-anim"></div>' ,
			'    </div>' ,
			'  </div>',
			'</div>'
			].join('')), //��������л������DOM����
			
			 LIST_TPL = new Xtpl([
			'<div class="subject-content" style="width:{{contentWidth}}px;">',
			'  {{#each data}}',
			'  <div class="subject-item J_DblclickTo" data-title="{{skuName}}" data-price="{{skuPrice}}" data-link="http://a.m.tmall.com/i{{{itemId}}}.htm">',
			'    <img data-view="{{xindex}}" alt="{{skuName}}" src="{{{skuImgUrl}}}" style="width:{{../winWidth}}px;" />', 
			'  </div>',
			'  {{/each}}',
			'</div>',
			'<div class="subject-nav">',
			'  <div class="subject-nav-viewport">',
			'    <div class="subject-nav-content" style="width:{{navContentWidth}}px;">',// 
			'      <div class="subject-nav-item"><div class="subject-nav-itembox list-prev" id="J_ListPrev"></div></div>',
			'    {{#each data}}',
			'      <div class="subject-nav-item">',
			'        <div class="subject-nav-itembox"><img data-view="{{xindex}}" alt="{{skuName}}" src="{{{skuImgUrl}}}"' + // 
				' style="width:100%;" /></div>',
			'      </div>',
			'    {{/each}}',
			'      <div class="subject-nav-item"><div class="subject-nav-itembox list-next" id="J_ListNext"></div></div>',
			'    </div>',
			'  </div>',
			'</div>',
			'<div class="subject-topnav" id="J_TopNav">',
			'  <div class="subject-nav-back" id="J_ShowList"></div>',
			'  <div class="subject-nav-share" id="J_IShare"><div class="subject-nav-share-demo" id="J_IShareDemo"></div></div>',
			'  <div class="subject-nav-fav" id="J_SubjectFav"><i></i></div>',
			'</div>',
			'<div class="assistivetouch-box" id="J_ATBox">',
			'  <div class="at-catbox" id="J_Cat"><div class="at-cat" id="J_Cat"></div></div>',
			'  <div class="at-dot" id="J_Dot"></div>',
			'  <div class="at-menu">',
			'    <div class="at-item-title" id="J_ItemTitle"></div>',
			'    <div class="at-item-price" id="J_ItemPrice"></div>',
			'    <div class="at-item-detail" id="J_ToDetail">�鿴����</div>',
			'  </div>',
			'</div>'
			].join('')), //detail�������������
			
			GUIDE_TPL = new Xtpl([
				'<ul class="guide-content" style="width:1600px;" id="J_GuideOn">',
				'	<li style="background-image:url(http://img02.taobaocdn.com/tps/i2/T1aMlmFn4cXXae1H3s-640-880.png)"></li>',
				'	<li style="background-image:url(http://img02.taobaocdn.com/tps/i2/T1wDJjFjxfXXae1H3s-640-880.png)"></li>',
				'	<li style="background-image:url(http://img03.taobaocdn.com/tps/i3/T1MA8oFhpXXXae1H3s-640-880.png)"></li>',
				'	<li style="background-image:url(http://img04.taobaocdn.com/tps/i4/T1kX0pFbBXXXae1H3s-640-880.png);"></li>',
				'	<li style="background-image:url(http://img01.taobaocdn.com/tps/i1/T1MXRoFX0bXXae1H3s-640-880.png);" id="J_GuideHide"></li>',
				'</ul>'
			].join('')),//��������
		
			UI_TPL = new Xtpl([
			'<div class="subject-viewport" style="height:{{winHeight}}px"></div>',
			'<div class="subject-tip" id="J_Tip">�������¿��ٻ������л�ר��</div>',
			'<div class="subject-list-loading" id="J_ListLoading"></div>'
			].join('')),//tips loading �ȹ���ģ����
			
			ITEMLIST_TPL = new Xtpl([
            '{{#each data}}',
            '<li class="list-item J_ListItemGo" data-go="{{listId}}">',
            '  <img class="subject-list-item-icon" src="{{banner}}" alt="{{title}}">',
            '  <i class="subject-list-item-name">{{title}}</i>',
            '</li>',
            '{{/each}}'].join(''));//list����������

		/**
		 * DOM�ṹ��Ⱦ
		 */
		function domRender(){
			var list = model.list,
				itemWidth = 320,
				navItemWidth = 80,
				velocity = 0.2;
			
			list.contentWidth = list.data.length * itemWidth;
			list.navContentWidth = (list.data.length + 2) * navItemWidth;
			list.winWidth = itemWidth;
			list.winHeight = window.innerHeight; //  + 60 hide addressbar
	
			var $body = S.one(document.body),
				$content = S.one('#J_PhoneDetail') || {},
				$viewport = S.one('.subject-viewport');
			
			
			
			// init DOM
			if (!inited) {
				//��Ӹ��ڵ�
				$body.append(S.DOM.create(ROOT_TPL.render()));
				
				//���List�����
				S.getScript('data/list.json',function(){
					if(LIST_DATA.success){
						var $listBox = S.get('#J_ListMore');
						S.DOM.insertBefore(S.DOM.create(ITEMLIST_TPL.render(LIST_DATA)), $listBox);
						//һ���԰󶨵��¼� [��Ҫ��List]
						listBind();
					}
					//��ȡ����
					Hammer(S.get('#J_ListMore')).on('tap', function (ev) {
                        setTimeout(function(){
                            var $listBox = S.get('#J_ListMore');
                            S.DOM.insertBefore(S.DOM.create(ITEMLIST_TPL.render(LIST_DATA)), $listBox);
                            //��List]
                            listBind(true);
							phoneGlobal.listOpenMark = true;
							
							//loading����
							S.one('#J_LadingBox').show();
							window.setTimeout(function(){
								S.one('#J_LadingBox').hide();
							},500)
                        },500);
                    });
				});

				//���Detail���
				$content = S.one('#J_PhoneDetail');
				$content.append(UI_TPL.render(list));
				$viewport = S.one('.subject-viewport');
			}
			
			var $loading = S.one('#J_LadingBox'),
				$tip = S.one('#J_Tip');
	
			// 
			// slide init
			//
			$viewport.html(LIST_TPL.render(list));
			
			phoneGlobal.fsSlide = Flipsnap('.subject-content');
			
			var fsSlide = phoneGlobal.fsSlide;
			
			//�״μ��صĵ���
			if(!Cookie.get('markStart')){
				
				S.one('#J_Guide').append(GUIDE_TPL.render());
				
				Flipsnap('#J_GuideOn');
				
				Hammer(S.get('#J_GuideHide')).on('tap', function (ev) {
					S.one('#J_Guide').css('display','none');
				});
				
				Cookie.set('markStart', 1, 365 * 102);
			}else{
				S.one('#J_Guide').css('display','none');
			}
				
			function showTip(innerText) {
				if(innerText){
					$tip[0].innerHTML = innerText;
				}
				$tip.addClass('tipRun');
				setTimeout(function(){
					hideTip();
				},1000)
			}
			phoneGlobal.showTip = showTip;
	
			function hideTip() {
				$tip.removeClass('tipRun');
				$tip[0].innerHTML = '';
			}
	
			// ʹ�� hashbang ��¼ view index 
			fsSlide.element.addEventListener('fstouchend', function(ev) {
				var curView = getItemId(), // NaN�����
					newView = ev.newPoint;
				
				//U.log('fstouchend', curView, newView);
				if (curView != newView) {
					location.hash = '!' + phoneGlobal.listId + '/' +  newView; // reset
					history.replaceState({state:phoneGlobal.listId},'',['sub.html?id=' + phoneGlobal.listId  + location.hash]);
				}
				//hideTip();
				
				//�ӳ�ִ�б���ͼ۸��ֱ����Ⱦ
				window.setTimeout(function(){itemDataRander();},200);
				
				fsNavSlide.moveToPoint((fsSlide.currentPoint + 1)/2);
				
				
			}, false);
	
			// nav init
			var $nav = S.one('.subject-nav'),
				$topNav = S.one('#J_TopNav');
	
			function isNavShow() {
				var bottom = parseInt($nav.css('bottom'), 10);
				return bottom === 0;
			}
	
			function hideNav() {
				$nav.css('bottom', '-140px');
			}
			
			// TODO ������mobile-issue��ios 6.1 safari��tap����bug������ҳ����ת������
			//Hammer($navBack.getDOMNode()).on('click', function(e) {
			//    location.href = 'list.html';
			//});
	
			phoneGlobal.fsNavSlide = Flipsnap('.subject-nav-content', {
				distance: navItemWidth * 2, // 80px * 2
				maxPoint: (list.data.length + 2 - itemWidth / navItemWidth) / 2
			});
			
			var fsNavSlide = phoneGlobal.fsNavSlide;
	
			//����λ��ĩλ�����⴦��
			S.each(S.all('.subject-nav-item'), function(item, i) {
				var $item = S.one(item);
				if(i == 0 || i == (S.query('.subject-nav-item').length - 1)){
					//��λ��ĩλ
				}else{
					Hammer(item).on('tap', function(e) {
						fsSlide.moveToPoint(i - 1);
						location.hash = '!' + phoneGlobal.listId + '/' +  (i - 1);
						history.replaceState({state:phoneGlobal.listId},'',['sub.html?id=' + phoneGlobal.listId  + location.hash]);
						itemDataRander();
					}, {swipe_velocity: velocity});
				}
			});
			
			// delay hide
			setTimeout(function() {
				$loading.hide();
			}, 500);
	
		}
		
		/**
		 * ����Ҫ�ظ��󶨵��¼�
		 */
		function listBind(review){
			phoneGlobal.listOpenMark = false;

			//�󶨵��ListͼƬ�����Ӧ���б�
			S.each(S.query('.J_ListItemGo'), function(item, i) {
				//����
				Hammer(item).on('tap',function(ev) {
					phoneGlobal.listOpenMark = false;
					listBoxClose();
					setTimeout(function(){
						var id = S.one(item).attr('data-go')*1;
						if(phoneGlobal.listId == id){
							//ͬһ��Ŀ¼�Ļ��Ͳ������ˡ���
						} else{
							phoneGlobal.listOpenMark = false;
							location.hash = '!' + id + '/' +  '0';
							phoneGlobal.listId = id;
							history.replaceState({state:id},'',['sub.html?id=' + id  + location.hash]);
							//����loading
							S.one('#J_LadingBox').show();
							go(id);
						}
					},500);
				});
				
			});
			
			//��֤��Щ����Զִֻ��һ��
			if(!review){
				//�б������
				function listBoxOpen(){
					S.one('#J_PhoneDetail').addClass('phoneDetailRun');
					S.one('#J_ListLoading').css({"display":"block"});
					S.one('#J_PhoneList').css({"display":"block"});
				}
				phoneGlobal.listBoxOpen = listBoxOpen;
				
				function listBoxClose(){
					S.one('#J_PhoneDetail').removeClass('phoneDetailRun');
					S.one('#J_ListLoading').css({"display":"none"});
					S.one('#J_PhoneList').css({"display":"none"});
					phoneGlobal.aTBoxClouse();
				}
				phoneGlobal.listBoxClose = listBoxClose;
				
				//ģ��overflow:auto
				function getiScroll() {
					if (!iScroll) {
						setTimeout(function () {
							getiScroll();
						}, 500);
					} else {
						var myscroll = new iScroll("J_PhoneList", {
							snap: "li",
							momentum: true,
							hScroll: false,
							hScrollbar: false,
							vScrollbar: true
						});
					}
				}
			}
			
		}
		
		/**
		 * ���Ժ���
		 */
		function review(){
			
			var fsSlide = phoneGlobal.fsSlide,
				fsNavSlide = phoneGlobal.fsNavSlide,
				view = getItemId();

			//����index
			fsSlide.moveToPoint(view);
			
			//��ݵ���
			fsNavSlide.moveToPoint(parseInt((fsSlide.currentPoint + 1)/2));


			if(phoneGlobal){
				
				//���Сè��״̬�£�����ͼƬ������Ϊ�ر�Сè
				if(phoneGlobal.transformMark){
					phoneGlobal.aTBoxOpen();
				}
				//������Ԥ���򿪣���ر�
				if(!phoneGlobal.toggleNavMark){
					phoneGlobal.toggleNav(true);
				}
			}
			
		}
		
		/**
		 * �¼�������
		 */
		function activeBind(){
			
			var J_ATBox = S.get('#J_ATBox'),//��ȡСè
				$nav = S.one('.subject-nav'),
				$topNav = S.one('#J_TopNav'),//��ȡ��������
				mainButtonActive = true,//��Сè�ĵ������
				topbarMark = false, //�������������� trueΪ����
				$loading = S.one('#J_LadingBox'),//loading����״̬
				velocity = 0.2,
				barStatus = {
					status : 0	
				};
			
			//��ÿ��item���¼���
			/**
			S.each(S.all('.subject-item'), function(item, i) {
				var hItem = Hammer(item);
				
				//��������ק������
				hItem.on('swipeup', function(e) {
					//changeSubject(model.next);
					if(barStatus.status === 0){
						toggleNav();
						barStatus.status = -1;
					}
					
					if(barStatus.status === 1){
						toggleTopNav();
						barStatus.status = 0;
					}
					
				}, {swipe_velocity: velocity});
				
				//��������ק������
				hItem.on('swipedown', function(e) {
					//changeSubject(model.prev);
					if(barStatus.status === 0){
						toggleTopNav();
						barStatus.status = 1;
					}
					
					if(barStatus.status === -1){
						toggleNav();
						barStatus.status = 0;
					}
	
				}, {swipe_velocity: velocity});
			});
			*/
			
			//��˫��ͼƬ����detail
			S.each(S.query('.J_DblclickTo'), function(item, i) {
				
				//˫��
				Hammer(item).on('doubletap',function(ev) {
					window.location.href = S.one(this).attr('data-link');
				});
				
				//����
				Hammer(item).on('tap',function(ev) {
					//���Сè��״̬�£�����ͼƬ������Ϊ�ر�Сè
					if(phoneGlobal.transformMark){
						aTBoxClouse();
					} else { 
						//���Сè�ر�״̬�£���������
						if(!topbarMark){
							KISSY.one('#J_TopNav').addClass('subjectTopnavRun'); //������������
							topbarMark = true;//��ס�����ż״̬
						}else{
							KISSY.one('#J_TopNav').removeClass('subjectTopnavRun'); //�رն�������
							S.one('#J_IShareDemo').css('display','none');//���õģ�����Ҳ�����ر�һ�°ɡ�
							topbarMark = false;
						}
					}
				});
				
				//����
				Hammer(item).on('hold',function(ev) {
					toggleNav();
				});
				
			});
			
			//List�б���
			Hammer(S.get('#J_ShowList')).on('tap',function(){
				if(!phoneGlobal.listOpenMark){
					phoneGlobal.listOpenMark = true;
					phoneGlobal.listBoxOpen();//��
				}
			});
			
			//��Ӱ����������List
			Hammer(S.get('#J_ListLoading')).on('tap',function(){
				if(phoneGlobal.listOpenMark){
					phoneGlobal.listOpenMark = false;
					phoneGlobal.listBoxClose();//�ر�
				}
			});
			
			//Сè�ĵ����¼�
			Hammer(J_ATBox).on('tap',function(){
				if(mainButtonActive){
					aTBoxOpen();//��
				}else{
					aTBoxClouse();//�ر�
				}
			})
			
			//Сè����ק�¼�
			Hammer(J_ATBox).on('touchstart', function(e) {
				e.preventDefault();
				if(!phoneGlobal.transformMark){
					var touch = e.touches[0];
					var obj = J_ATBox;
					
					obj.lastX=touch.pageX;
					obj.lastY=touch.pageY;
					if(!obj.moveX){
						obj.moveX=0;
						obj.moveY=0;
					}
					S.one(J_ATBox).css('-webkit-transition','all 0s 0s');
				}
			});
			
			Hammer(J_ATBox).on('touchmove', function(e) {
				e.preventDefault();
				if(!phoneGlobal.transformMark){
					var touch = e.touches[0],
					maxHeight = -(phoneGlobal.height - 80),
					maxWidth = (phoneGlobal.width - 70),
					obj = J_ATBox;
				
					//��ȡƫ����
					obj.moveX += (touch.pageX-obj.lastX);
					obj.moveY += (touch.pageY-obj.lastY);
					obj.moveX = (obj.moveX < -10)?-10:obj.moveX;
					obj.moveX = (obj.moveX > maxWidth)?maxWidth:obj.moveX;
					obj.moveY = (obj.moveY > 0)?0:obj.moveY;
					obj.moveY = (obj.moveY < maxHeight)?maxHeight:obj.moveY;
					
					S.one(J_ATBox).css('-webkit-transform','translate('+obj.moveX+'px,'+obj.moveY+'px)');
					obj.lastX=touch.pageX;
					obj.lastY=touch.pageY;
				}
			});
			
			//Сè����קֹͣ�ظ�CSS3����
			Hammer(J_ATBox).on('touchend', function(e) {
				S.one(J_ATBox).css('-webkit-transition','all 0.2s 0s');
			});
			
			//Сè������Ҳ�ܿ��ؿ��ͼƬ��
			Hammer(J_ATBox).on('hold', function(e) {
				toggleNav();
			});
			
			//��һ���ר��
			Hammer(S.get('#J_ListNext')).on('tap', function(e) {
				//�˻������ͷβ�ν�o(��_��)o 
				phoneGlobal.goTheWay = true;
				changeSubject(model.next);
			});
			
			//��һ���ר��
			Hammer(S.get('#J_ListPrev')).on('tap', function(e) {
				phoneGlobal.goTheWay = false;
				changeSubject(model.prev);
			});
			
			//����ղ�
			Hammer(S.get('#J_SubjectFav')).on('tap', function(e) {
				if(S.one('.subjectNavFavRun',S.get('#J_SubjectFav'))){
					S.one('i',S.get('#J_SubjectFav')).removeClass('subjectNavFavRun');
					phoneGlobal.showTip('ȡ���ղأ�');
				} else {
					S.one('i',S.get('#J_SubjectFav')).addClass('subjectNavFavRun');
					phoneGlobal.showTip('�ɹ��ղص�ǰ��Ʒ��');
				}
			});
			
			//������
			Hammer(S.get('#J_IShare')).on('tap', function(e) {
				if(S.one('#J_IShareDemo').css('display') == 'none'){
					S.one('#J_IShareDemo').css('display','block');
				} else {
					S.one('#J_IShareDemo').css('display','none');
					phoneGlobal.showTip('�Ѿ�����΢��');
					setTimeout(function(){
						KISSY.one('#J_TopNav').removeClass('subjectTopnavRun'); //�رն�������
						topbarMark = false;
					},600);
				}
			});
			
			//�����������ҳ
			Hammer(S.get('#J_ToDetail')).on('tap', function(e) {
				location.href = S.one(S.query('.J_DblclickTo')[phoneGlobal.fsSlide.currentPoint]).attr('data-link');
			});
			
			//Сè�Ĺر�
			function aTBoxClouse(){
				S.one(J_ATBox).css('-webkit-transform',phoneGlobal.transformMark);//����Сè�Ķ�λ
				phoneGlobal.transformMark = false;//g��֪Сè�Ѿ��պ�
				
				KISSY.one(J_ATBox).removeClass('startRun');//��ʼ��CSS3����
				KISSY.one('.at-menu', J_ATBox).removeClass('atMenuRun');
				
				KISSY.one('#J_TopNav').removeClass('subjectTopnavRun');
				mainButtonActive = true;//��ס�����ż״̬
				topbarMark = false;//��ס�����ż״̬
			}
			phoneGlobal.aTBoxClouse = aTBoxClouse;
			
			//Сè�Ĵ�
			function aTBoxOpen(){
				var _J_ATBox = S.one(J_ATBox);
				
				phoneGlobal.transformMark = _J_ATBox.css('-webkit-transform') || true;//��סСè�Ķ�λ

				_J_ATBox.css('-webkit-transform','translate(0px, 0px)');
				itemDataRander();
				
				KISSY.one(J_ATBox).addClass('startRun');//��ʼ��CSS3����
				setTimeout(function(){KISSY.one('.at-menu', J_ATBox).addClass('atMenuRun');},200);

				KISSY.one('#J_TopNav').addClass('subjectTopnavRun'); //������������
				mainButtonActive = false;
				topbarMark = true;//��ס�����ż״̬
			}
			//���Ÿ���ǰȫ��
			phoneGlobal.aTBoxOpen = aTBoxOpen;
			
			/**
			 * @param {string} id
			 */
			function changeSubject(id) {
				// TODO 
				// history api ����PC�˺��ֻ��ˣ�����url�䶯����hash��
				// ����android back��������hashchange
				//location.href = "sub.html?id=" + id;
				
				//�òμ�¼�Լ���listId,֪ͨȫ��
				phoneGlobal.listId = id;

				if (phoneGlobal.goTheWay) {
					location.hash = '!' + id + '/' +  '0';
					history.replaceState({state:id},'',['sub.html?id=' + id  + location.hash]);
				} else {
					location.hash = '!' + id + '/' +  '999';
					history.replaceState({state:id},'',['sub.html?id=' + id  + location.hash]);
				}
				
				$loading.show();
				go(id);
			}
			
			//��������
			function toggleTopNav(){
				var top = parseInt($topNav.css('top'), 10);
				$topNav.css('top', top < 0 ? 0 : '-44px');
			}
			
			//�ײ��˵�������
			function toggleNav(review) {
				var bottom = parseInt($nav.css('bottom'), 10),
					_toggleNav = phoneGlobal.toggleNavMark;
				if(!review){
					if(_toggleNav){
						S.one(J_ATBox).removeClass('at-box-over');
						phoneGlobal.toggleNavMark = false;
					}else{
						S.one(J_ATBox).addClass('at-box-over');
						phoneGlobal.toggleNavMark = true;
					}
				}
				$nav.css('bottom', bottom < 0 ? 0 : '-140px');
				
			}
			
			//���Ÿ���ǰȫ��
			phoneGlobal.toggleNav = toggleNav;
		}
		
		//��������
		function itemDataRander(){
			//�޸����������������
			var dataItem = S.one(S.query('.subject-item')[phoneGlobal.fsSlide.currentPoint]);
			S.get('#J_ItemTitle').innerHTML = dataItem.attr('data-title');
			S.get('#J_ItemPrice').innerHTML = 'ȫ��ͳһ:��' + dataItem.attr('data-price');	
		}

		phoneInit();
    }

	/**
	 * PC�˹���
	 */
    function renderPc(model) {
		
		// PC���б�ģ��
		var PC_LIST_TPL = new Xtpl([
			'<ul class="j-subject-container subject-container">',
			'{{#each data}}<li>',
			'<div class="list-container">',
			'<img width="{{width}}" height="{{height}}" src="{{skuImgUrl}}" />',
			'<div class="cover-container">',
			'<a target="_blank" href="{{skuClickUrl}}">',
			'<div class="top-mask" style="width:{{width}}px; height:{{height}}px;">',
			'{{set check_detail_top = (height -50)/2 check_detail_left = (width - 72)/2}}',
			'<p class="check-detail" style="top:{{check_detail_top}}px; left:{{check_detail_left}}px;"></p>',
			'</div>',
			'</a>',
			'<div class="sku-info">',
			'<p class="sku-name" title="{{skuName}}">{{skuName}}</p>',
			'<p class="sku-price">&yen;{{skuPrice}}</p>',
			'</div>',
			'</div>',
			'</div>',
			'</li>{{/each}}',
			'</ul>'
			].join(''));

        var $content,
            list;

        $content = S.one('#content');
        list = model.list;
        $content.append(PC_LIST_TPL.render(list));

        S.use('gallery/autoResponsive/1.0/index', function(S, AutoResponsive) {
            new AutoResponsive({
                container: '.j-subject-container',
                selector: 'li',
                colMargin: {
                    x: 10,
                    y: 10
                }
            });
        });
    }
	
	/**
	 * resize��Ҫ��������ʾ�õ�
	 */
	function resizePhone(){
		var resizeLater = false;//�����ӳ�ִ��resize��ֹ�¼��ѵ�
		S.Event.on(window,'resize',function(){
			if(resizeLater){
				clearTimeout(resizeLater);
			}
			resizeLater = setTimeout(function(){
				if(innerWidth < 480){
					S.one('#J_PhoneDetail .subject-nav').css({'bottom':'0'});
					S.one('#J_PhoneDetail .subject-viewport').css({'height':innerHeight + 'px'});
				}
			},200);	
		});
	}

    // init
    init();
});


if (window.addEventListener) {
    window.addEventListener("load", function() {
        setTimeout(function() {
            window.scrollTo(0, 1);
        }, 0);
    });
}