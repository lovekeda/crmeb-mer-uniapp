<template>
	<!-- 小程序使用 page-meta -->
	<!--#ifdef MP-->
	<page-meta :page-style="pageStyle"></page-meta>
	<!--#endif-->
	<view :data-theme="theme">
		<!--#ifdef MP-->
		<view class='cart_nav'>
			<nav-bar iconColor='#fff' ref="navBarRef" :isBackgroundColor="false">
			</nav-bar>
		</view>
		<!--#endif-->
		<view v-if="!successful" @touchstart="touchStart">
			<form report-submit='true'>
				<view class='merchantsSettled' :style="settledPageStyle">
					<view class="merchantBg">
						<image class="bag" :src="merchantBg" mode="widthFix" alt="" srcset="" />
					</view>
					<view v-if="!merchantData.name" class="application-record" @click="jumpToList">
						申请记录
						<text class="iconfont icon-ic_rightarrow"></text>
					</view>
					<view class="settled-content-bg w-100-p111-" :style="{ backgroundImage: settledBgGradient }">
						<view class='list pt-32'>
							<view class="item">
								<view class="acea-row row-middle required">
									<text class="item-name">{{applyText}}名称</text>
									<input :disabled="merchantData.auditStatus&&parseFloat(merchantData.auditStatus)<3" type="text"
										:maxlength="isCn ? '16' : '16'" :placeholder="applyText + '名称'" v-model="merchantData.name" @change="validateBtn"
										placeholder-class='placeholder' />
								</view>
							</view>
							<view class="item">
								<view class="acea-row row-middle required">
									<text class="item-name">用户姓名</text>
									<input :disabled="merchantData.auditStatus&&parseFloat(merchantData.auditStatus)<3" type="text"
										placeholder="用户姓名" v-model="merchantData.realName" @change="validateBtn"
										placeholder-class='placeholder' />
								</view>
							</view>
							<view class="item">
								<view class="acea-row row-middle required">
									<text class="item-name">联系电话</text>
									<input :disabled="merchantData.auditStatus&&parseFloat(merchantData.auditStatus)<3" type="number"
										class="texts" v-model="merchantData.phone" maxlength="11" placeholder="联系电话"
										style="margin:0;width: 252rpx;" @change="validateBtn" />

								</view>
							</view>
							<view class="item rel"
								v-if="(isKey&&parseFloat(merchantData.auditStatus)>2) || (!isKey&&!merchantData.auditStatus)">
								<view class="acea-row row-middle required">
									<text class="item-name">验证码</text>
									<input :disabled="merchantData.auditStatus&&parseFloat(merchantData.auditStatus)<3" type="text"
										placeholder="验证码" v-model="merchantData.captcha" maxlength="6" @change="validateBtn" class="codeIput"
										placeholder-class='placeholder' />
									<button class="code" :disabled="disabled" :class="disabled === true ? 'on' : ''"
										@click="handleVerify">
										{{ text }}
									</button>
								</view>
							</view>
							<view class="item picker-item" v-if="isStoreApply" @tap="openStorePicker('category')">
								<view class="uni-list">
									<view class="uni-list-cell">
										<view class="uni-list-cell-db acea-row row-middle required">
											<text class="item-name">店铺分类</text>
											<view class="picker-value" :class="{ placeholder: !merchantCategoryName }">
												{{ merchantCategoryName || '店铺分类' }}
											</view>
											<view class='iconfont icon-ic_rightarrow'></view>
										</view>
									</view>
								</view>
							</view>
							<view class="item picker-item" v-if="isStoreApply" @tap="openStorePicker('type')">
								<view class="uni-list">
									<view class="uni-list-cell">
										<view class="uni-list-cell-db acea-row row-middle required">
											<text class="item-name">店铺类型</text>
											<view class="picker-value" :class="{ placeholder: !merchantTypeName }">
												{{ merchantTypeName || '店铺类型' }}
											</view>
											<view class='iconfont icon-ic_rightarrow'></view>
										</view>
									</view>
								</view>
							</view>
							<view class="item picker-item" v-if="isStoreApply" @tap="openStorePicker('business')">
								<view class="uni-list">
									<view class="uni-list-cell">
										<view class="uni-list-cell-db acea-row row-middle">
											<text class="item-name ml-16">归属商户</text>
											<view class="picker-value" :class="{ placeholder: !businessName }">
												{{ businessName || '不选择商户' }}
											</view>
											<view class='iconfont icon-ic_rightarrow'></view>
										</view>
									</view>
								</view>
							</view>
							<view class="item">
								<view class="acea-row row-middle">
									<text class="item-name ml-16">{{isBusinessApply ? '简介' : '关键字'}}</text>
									<input :disabled="merchantData.auditStatus&&parseFloat(merchantData.auditStatus)<3" type="text"
										maxlength="30" :placeholder="isBusinessApply ? '简介' : '关键字'" v-model="merchantData.keywords" placeholder-class='placeholder' />
								</view>
							</view>
							<view class="item" v-if="merchantData.auditStatus == 2">
								<view class="acea-row row-middle">
									<text class="item-name ml-16 flex-shrink">{{applyText}}后台</text>
									<view class="wrap-text width-470">{{merchantData.merSiteUrl}}</view>
								</view>
							</view>
							<view class="item no-border">
								<text class="acea-row row-middle required item-title">请上传营业执照及行业相关资质证明图片</text>
								<text v-if="merchantTypeInfo" class="item-title">( {{merchantTypeInfo}} )</text>
								<text class="item-desc">(图片最多可上传5张，格式支持JPG、PNG、JPEG)</text>
								<view class="upload">
									<view class='pictrue rd-16rpx' v-for="(item,index) in pics" :key="index" :data-index="index"
										@click="getPhotoClickIdx">
										<image :src='item' class="rd-16rpx"></image>
										<view v-if="(isKey&&parseFloat(merchantData.auditStatus)>2) || (!isKey&&!merchantData.auditStatus)"
											class="bottom_close close-btn" @click.stop='DelPic(index)' style="top:40rpx">
											<view class="iconfont icon-ic_close f-s-24 text--w111-fff"></view>
										</view>
									</view>
									<view class='pictrue rd-16rpx acea-row row-center-wrapper row-column' @click='uploadpic'
										v-if="pics.length < 5 && ((isKey&&parseFloat(merchantData.auditStatus)>2) || (!isKey&&!merchantData.auditStatus))">
										<text class='iconfont icon-icon25201'></text>
										<view>上传凭证</view>
									</view>
								</view>
							</view>
							<view v-if="(isKey&&parseFloat(merchantData.auditStatus)>2) || (!isKey&&!merchantData.auditStatus)"
								class="item no-border acea-row row-center row-middle">
								<checkbox-group @change='ChangeIsAgree' class="acea-row row-middle">
									<checkbox class="checkbox" :checked="isAgree ? true : false" />
									<span class="agree">已阅读并同意</span>
								</checkbox-group>
								<button class="settleAgree" @click="showProtocol = true">《入驻协议》</button>
							</view>
							<button v-if="(isKey&&parseFloat(merchantData.auditStatus)>2) || (!isKey&&!merchantData.auditStatus)"
								:disabled="loading || (merchantData.auditStatus&&parseFloat(merchantData.auditStatus)<3)" class='submitBtn'
								:class="successful === true ? 'on':''" @click="formSubmit">提交申请</button>
						</view>
					</view>
				</view>
			</form>
			<view class="settlementAgreement" v-if="showProtocol">
				<view class="setAgCount">
					<CloseIcon @handle-close="showProtocol=false" topStyle="top:28rpx"></CloseIcon>
					<div class="title">{{applyText}}入驻协议</div>
					<view class="content">
						<jyf-parser :html="protocol" ref="article" :tag-style="tagStyle"></jyf-parser>
					</view>
				</view>
			</view>
			<view class='loadingicon acea-row row-center-wrapper' v-if="loading">
				<text class='loading iconfont icon-jiazai' :hidden='loading==false'></text>
			</view>
			<uni-popup ref="storePickerPopup" type="bottom" background-color="#fff">
				<view class="store-picker-popup">
					<view class="store-picker-header acea-row row-between-wrapper">
						<text class="store-picker-action" @tap="closeStorePicker">取消</text>
						<text class="store-picker-title">{{ storePickerTitle }}</text>
						<text class="store-picker-action text-right" @tap="clearStorePicker">{{ storePickerType === 'business' ? '清除' : '' }}</text>
					</view>
					<scroll-view scroll-y class="store-picker-list">
						<view v-if="storePickerLoading" class="store-picker-empty">加载中...</view>
						<view v-else-if="!storePickerOptions.length" class="store-picker-empty">{{ storePickerEmptyText }}</view>
						<view class="store-picker-option" v-for="(item, index) in storePickerOptions" :key="item.id || index"
							@tap="selectStorePicker(index)">
							<text>{{ item.name }}</text>
							<text v-if="storePickerIndex === index" class="store-picker-selected">已选</text>
						</view>
					</scroll-view>
				</view>
			</uni-popup>
		</view>
		<view class="settledSuccessMain" v-else>
			<view class="settledSuccessful">
				<image class="image" src="../static/images/settledSuccessful.svg" alt="" />
				<view class="title">恭喜，您的资料提交成功！</view>
				<view class="info">预计15个工作日内审核完毕，平台客服会及时与您联系！</view>
				<view class="goHome" hover-class="none" @click="goHome">
					返回首页
				</view>
			</view>
		</view>
		<Verify @success="handlerOnVerSuccess" @closeVerfiy="closeVerfiy" :captchaType="'clickWord'"
			:imgSize="{ width: '330px', height: '155px' }" ref="verify"></Verify>
	</view>
</template>
<script>
	// +----------------------------------------------------------------------
	// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
	// +----------------------------------------------------------------------
	// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
	// +----------------------------------------------------------------------
	// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
	// +----------------------------------------------------------------------
	// | Author: CRMEB Team <admin@crmeb.com>
	// +----------------------------------------------------------------------
	import {
		agreementInfo
	} from '@/api/api.js'
	import {
		toLogin
	} from '@/libs/login.js';
	import {
		getMerSettledApplyApi,
		getBusinessOptionsApi,
		sendSettledCodeApi,
	} from '@/api/merchant.js';

	import {
		mapGetters
	} from "vuex";
	import parser from "../components/jyf-parser/jyf-parser";
	import sendVerifyCode from "@/mixins/SendVerifyCode";
	import Verify from '../components/verifition/verify.vue';
	import navBar from '@/components/navBar';
	import uniPopup from '@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue';
	import {
		Debounce
	} from '@/utils/validate.js'
	const app = getApp();
	export default {
		components: {
			"jyf-parser": parser,
			Verify,
			navBar,
			uniPopup
		},
		watch: {
			'merchantData.name': function(val) {
				let pattern = new RegExp('[\u4E00-\u9FA5]+');
				let pattern2 = new RegExp('[A-Za-z]+');
				if (pattern.test(val)) {
					this.isCn = true;
				} else if (pattern2.test(val)) {
					this.isCn = false;
				}
			},
		},
		data() {
			return {
				windowHeight: app.globalData.windowHeight,
				isCn: true,
				text: '获取验证码',
				disabled: false,
				isAgree: false,
				showProtocol: false,
				isShowCode: false,
				loading: false,
				merchantData: {
					applyType: 'store',
					name: "",
					realName: "",
					phone: "",
					captcha: '',
					categoryId: 0,
					handlingFee: '',
					keywords: '',
					qualificationPicture: '',
					typeId: 0,
					businessId: null
				},
				validate: false,
				successful: false,
				protocol: "",
				timer: "",
				merchantCategoryIndex: -1,
				merchantTypeIndex: -1,
				merchantCategoryName: '',
				merchantTypeName: '',
				businessName: '',
				businessList: [],
				pics: [],
				tagStyle: {
					img: 'width:100%;display:block;'
				},
				checkType: 'country',
				country: 'China',
				isType: false,
				merchantTypeInfo: '',
				theme: app.globalData.theme,
				merchantBg: '',
				applyType: 'store',
				storePickerType: '',
				storePickerLoading: false,
				isKey: '',
				isFixed: false,
				pageStyle: 'overflow: visible;', // 小程序页面样式
			};
		},
		mixins: [sendVerifyCode],
		beforeDestroy() {
			clearTimeout(this.timer)
		},
		computed: {
			...mapGetters(['globalData', 'isLogin', 'merchantClassify', 'merchantType', 'merSttledData']),
			isBusinessApply() {
				return this.applyType === 'business';
			},
			isStoreApply() {
				return this.applyType === 'store';
			},
			applyText() {
				return this.isBusinessApply ? '商户' : '店铺';
			},
			storePickerTitle() {
				if (this.storePickerType === 'category') return '选择店铺分类';
				if (this.storePickerType === 'business') return '选择归属商户';
				return '选择店铺类型';
			},
			storePickerOptions() {
				if (this.storePickerType === 'category') return this.merchantClassify || [];
				if (this.storePickerType === 'business') return this.businessList || [];
				return this.merchantType || [];
			},
			storePickerIndex() {
				if (this.storePickerType === 'category') {
					return this.merchantData.categoryId ? this.merchantCategoryIndex : -1;
				}
				if (this.storePickerType === 'business') {
					return this.merchantData.businessId ? this.businessList.findIndex(item => item.id == this.merchantData.businessId) : -1;
				}
				return this.merchantData.typeId ? this.merchantTypeIndex : -1;
			},
			storePickerEmptyText() {
				if (this.storePickerType === 'category') return '暂无可选店铺分类';
				if (this.storePickerType === 'business') return '暂无可选商户';
				return '暂无可选店铺类型';
			},
			settledBg() {
				return this.isBusinessApply ? '../static/images/settled_business_bg.jpg' : '../static/images/settled_store_bg.jpg';
			},
			settledBgColor() {
				return '#EB3B26';
			},
			settledBgGradient() {
				return 'linear-gradient(180deg, #FE7015 0%, #EB3B26 100%)';
			},
			settledPageStyle() {
				return {
					backgroundColor: this.settledBgColor,
					backgroundImage: this.settledBgGradient
				};
			},
		},
		mounted() {
			if (this.isStoreApply) {
				this.$store.dispatch('MerCategoryList');
				this.$store.dispatch('MerTypeList');
				this.getBusinessOptions();
			}
			this.merchantBg = this.settledBg;
		},
		// 滚动监听
		onPageScroll(e) {
			this.isFixed = e.scrollTop > 160;
		},
		onShow() {
			if (!this.isLogin) {
				toLogin();
			}
			this.getConfig()
		},
		onLoad(options) {
			options = options || {};
			let that = this;
			this.applyType = options.applyType || options.type || (this.merSttledData && this.merSttledData.applyType) || 'store';
			if (this.applyType !== 'business') this.applyType = 'store';
			uni.setNavigationBarTitle({
				title: `${this.applyText}入驻`
			});
			uni.getSystemInfo({
				success: function(res) {
					that.windowHeight = res.windowHeight + 'px'
				},
			});
			if (options.key !== '1') {
				this.$store.commit('MERSTTLEDDATA', {});
				this.isKey = '';
			} else {
				this.isKey = options.key;
			}
			this.merchantData = Object.assign(this.defaultMerchantData(), this.merSttledData, {
				applyType: this.applyType
			});
			if (this.merchantData.qualificationPicture) {
				this.pics = this.merchantData.qualificationPicture;
			}
			if (this.isBusinessApply) {
				return;
			}
			this.initBusinessName();
			let idx = this.merchantData.categoryId;
			let index = this.merchantClassify.findIndex(item => item.id == idx);
			this.merchantCategoryIndex = index;
			if (this.merchantClassify[index]) {
				this.merchantCategoryName = this.merchantClassify[index].name;
				this.merchantData.handlingFee = this.merchantClassify[index].handlingFee;
			}
			let idxn = this.merchantData.typeId;
			let indexn = this.merchantType.findIndex(item => item.id == idxn);
			this.merchantTypeIndex = indexn;
			if (this.merchantType[indexn]) {
				this.merchantTypeName = this.merchantType[indexn].name;
				this.merchantTypeInfo = this.merchantType[indexn].info;
			}
		},
		methods: {
			async openStorePicker(type) {
				if (this.merchantData.auditStatus && parseFloat(this.merchantData.auditStatus) < 3) return;
				this.storePickerType = type;
				this.$refs.storePickerPopup.open();
				const hasOptions = this.storePickerOptions.length;
				if (hasOptions) return;
				this.storePickerLoading = true;
				try {
					if (type === 'business') {
						await Promise.race([
							this.getBusinessOptions(),
							new Promise(resolve => setTimeout(resolve, 5000))
						]);
					} else {
						await Promise.race([
							this.$store.dispatch(type === 'category' ? 'MerCategoryList' : 'MerTypeList').catch(() => {}),
							new Promise(resolve => setTimeout(resolve, 5000))
						]);
					}
				} finally {
					this.storePickerLoading = false;
				}
			},
			closeStorePicker() {
				this.$refs.storePickerPopup.close();
			},
			clearStorePicker() {
				if (this.storePickerType !== 'business') return;
				this.merchantData.businessId = null;
				this.businessName = '';
				this.closeStorePicker();
			},
			selectStorePicker(index) {
				if (this.storePickerType === 'category') {
					this.bindPickerChange({
						target: {
							value: index
						}
					});
				} else if (this.storePickerType === 'business') {
					this.selectBusiness(index);
				} else {
					this.bindPickerChange1({
						target: {
							value: index
						}
					});
				}
				this.closeStorePicker();
			},
			defaultMerchantData() {
				return {
					applyType: this.applyType,
					name: "",
					realName: "",
					phone: "",
					captcha: '',
					categoryId: 0,
					handlingFee: '',
					keywords: '',
					qualificationPicture: '',
					typeId: 0,
					businessId: null
				};
			},
			getBusinessOptions() {
				return getBusinessOptionsApi().then(res => {
					this.businessList = res.data || [];
					this.initBusinessName();
				}).catch(err => {
					this.businessList = [];
					return this.$util.Tips({
						title: err
					});
				});
			},
			initBusinessName() {
				if (!this.merchantData.businessId || !this.businessList.length) return;
				const business = this.businessList.find(item => item.id == this.merchantData.businessId);
				this.businessName = business ? business.name : '';
			},
			selectBusiness(index) {
				const business = this.businessList[index];
				if (!business) return;
				this.merchantData.businessId = business.id;
				this.businessName = business.name;
			},
			//滚动
			touchStart() {
				// #ifdef MP
				this.$refs.navBarRef.currentPage = false;
				// #endif
			},
			scroll() {
				uni.$emit('scroll');
			},
			moveHandle() {},
			getConfig() {
				// 获取配置
				agreementInfo('merincomminginfo').then(res => {
					if (res.data) {
						this.protocol = JSON.parse(res.data).agreement
					}
				}).catch(err => {
					return this.$util.Tips({
						title: err
					});
				});
			},
			bindPickerChange: function(e) {
				let idx = Number(e.target.value)
				this.index = idx
				this.merchantCategoryIndex = idx
				if (this.merchantClassify[idx]) {
					this.merchantData.categoryId = this.merchantClassify[idx]['id']
					this.merchantCategoryName = this.merchantClassify[idx]['name']
					this.merchantData.handlingFee = this.merchantClassify[idx]['handlingFee']
					this.validateBtn()
				}
			},
			bindPickerChange1: function(e) {
				let idx = Number(e.target.value)
				this.merchantTypeIndex = idx
				if (this.merchantType[idx]) {
					this.merchantData.typeId = this.merchantType[idx]['id']
					this.merchantTypeName = this.merchantType[idx]['name']
					this.merchantTypeInfo = this.merchantType[idx]['info']
					this.validateBtn()
				}
			},
			/*店铺类型说明*/
			getAgreement() {
				this.showProtocol = true;
				this.isType = true

			},
			// 图片预览
			// 获得相册 idx
			getPhotoClickIdx(e) {
				let _this = this;
				let idx = e.currentTarget.dataset.index;
				_this.imgPreview(_this.pics, idx);
			},
			// 图片预览
			imgPreview: function(list, idx) {
				// list：图片 url 数组
				if (list && list.length > 0) {
					uni.previewImage({
						current: list[idx], //  传 Number H5端出现不兼容
						urls: list
					});
				}
			},
			toggleTab(str) {
				this.$refs[str].show();
			},
			// 首页
			goHome() {
				this.$util.navigateTo('/pages/index/index');
			},
			/**
			 * 上传文件
			 *
			 */
			uploadpic: function() {
				let that = this;
				that.$util.uploadImageOne({
					url: 'upload/image',
					name: 'multipart',
					model: "user",
					pid: 0
				}, function(res) {
					that.pics.push(res);
					that.$set(that, 'pics', that.pics);
					that.validateBtn();
				});
			},
			/**
			 * 删除图片
			 *
			 */
			DelPic: function(index) {
				let that = this,
					pic = this.pics[index];
				that.pics.splice(index, 1);
				that.$set(that, 'pics', that.pics);
				that.validateBtn();
			},
			//滑块验证成功后
			handlerOnVerSuccess(data) {
				this.$refs.verify.hide();
				this.codeSend();
				this.pageStyle = 'overflow: visible;'; // 小程序
			},
			// 关闭滑块验证
			closeVerfiy() {
				this.pageStyle = 'overflow: visible;'; // 小程序
			},
			codeSend() {
				sendSettledCodeApi({
					phone: this.merchantData.phone
				}).then(res => {
					this.$util.Tips({
						title: res.message
					});
					this.sendCode();
				}).catch(err => {
					return this.$util.Tips({
						title: err
					});
				});
			},
			handleVerify: Debounce(function() {
				if (this.disabled) return;
				if (!this.merchantData.phone) return this.$util.Tips({
					title: '请填写手机号'
				});
				if (!this.isValidPhone(this.merchantData.phone)) return this.$util.Tips({
					title: '手机号格式不正确'
				});
				this.$refs.verify.show();
				this.pageStyle = 'overflow: hidden;'; // 小程序
			}),
			onConfirm(val) {
				this.region = val.checkArr[0] + '-' + val.checkArr[1] + '-' + val.checkArr[2];
			},
			ChangeIsAgree: function(e) {
				this.isAgree = !this.isAgree;
				this.validateBtn();
			},

			formSubmit: Debounce(function(e) {
				if (this.loading) return;
				if (this.validateForm() && this.validate) {
					if (this.pics.length == 0) return this.$util.Tips({
						title: "请上传资质图片"
					});
					this.loading = true;
					let submitData = Object.assign({}, this.merchantData, {
						applyType: this.applyType,
						qualificationPicture: JSON.stringify(this.pics)
					});
					if (this.isBusinessApply) {
						delete submitData.categoryId;
						delete submitData.typeId;
						delete submitData.handlingFee;
						delete submitData.businessId;
					} else {
						if (!submitData.businessId) delete submitData.businessId;
						submitData.address = this.country + ',' + this.address
					}
					getMerSettledApplyApi(submitData).then(data => {
						this.timer = setTimeout(() => {
							this.successful = true;
						}, 1000)

					}).catch(res => {
						this.loading = false;
						this.$util.Tips({
							title: res
						});
					})

				}
			}),
			validateBtn: function() {
				let that = this,
					value = that.merchantData;
				let baseValid = value.name && value.realName && value.phone && value.captcha && that.isAgree && that.pics.length;
				let typeValid = that.isBusinessApply || (value.categoryId && value.typeId);
				that.validate = !!(baseValid && typeValid);
			},
			isValidPhone(phone) {
				return /^1\d{10}$/.test(phone);
			},

			validateForm: function() {
				let that = this,
					value = that.merchantData;

				if (!value.name) return that.$util.Tips({
					title: '请输入店铺名称'
				});
				if (!value.realName) return that.$util.Tips({
					title: '请输入姓名'
				});
				if (!value.phone) return that.$util.Tips({
					title: '请输入手机号'
				});
				if (!that.isValidPhone(value.phone)) return that.$util.Tips({
					title: '手机号格式不正确'
				});
				if (!value.captcha) return that.$util.Tips({
					title: '请填写验证码'
				});
				if (!/^\d{6}$/.test(value.captcha)) return that.$util.Tips({
					title: '验证码格式不正确'
				});
				if (that.isStoreApply) {
					if (!value.categoryId) return that.$util.Tips({
						title: '请选择店铺分类'
					});
					if (!value.typeId) return that.$util.Tips({
						title: '请选择店铺类型'
					});
				}
				if (!that.isAgree) return that.$util.Tips({
					title: '请勾选并同意入驻协议'
				});
				that.validate = true;
				return true;
			},
			jumpToList() {
				uni.navigateTo({
					url: `/pages/merchant/application_record/index?applyType=${this.applyType}`
				})
			},

		}
	}
</script>

<style scoped lang="scss">
	.agree {
		/* #ifdef MP */
		margin-left: 15rpx;
		/* #endif */
		/* #ifndef MP */
		margin-left: 10rpx;
		/* #endif */
	}

	::v-deep checkbox {
		width: 36rpx !important;
		height: 36rpx !important;
	}

	.cart_nav {
		position: absolute;
	}

	::v-deep .uni-scroll-view {
		overflow: hidden auto !important;
	}

	.select_code {
		width: 16px;
		height: 8px;
		display: inline-block;
		margin-left: 16rpx;
	}

	.flag {
		width: 40rpx;
		height: 26rpx;
		display: inline-block;
	}

	.uni-input-placeholder {
		color: #B2B2B2;
	}

	.item-name {
		width: 160rpx;
	}

	.uni-list-cell {
		position: relative;

		.iconfont {
			font-size: 14px;
			position: absolute;
			right: 0;
			top: 7rpx;
		}
	}

	.merchantsSettled {
		@include main_bg_color(theme);
		background: linear-gradient(180deg, #FE7015 0%, #EB3B26 100%) !important;
		min-height: 100vh;
		height: auto;
		position: relative;
		padding-bottom: 40rpx;
	}

	.merchantsSettled .merchantBg {
		width: 100%;
		height: auto;

		.bag {
			width: 100%;
			display: block;
		}

		.merchantBg-title {
			text-align: center;
			color: #fff;
			font-size: 60rpx;
			font-weight: 600;
			margin-bottom: 20rpx;
		}

		.merchantBg-join {
			text-align: center;
			color: #fff;
			font-size: 36rpx;
		}
	}

	.merchantsSettled .list {
		background-color: #fff;
		border-radius: 12px;
		margin: 0 24rpx;
		padding-bottom: 32rpx;
		position: relative;
		width: calc(100% - 24px);
		z-index: 1;
	}

	.application-record {
		position: absolute;
		display: flex;
		align-items: center;
		top: 318rpx;
		right: 0;
		color: #fff;
		font-size: 22rpx;
		background-color: rgba(0, 0, 0, 0.3);
		padding: 8rpx 18rpx;
		border-radius: 20px 0px 0px 20px;
	}

	.settled-content-bg {
		min-height: calc(100vh - 358rpx);
		padding-bottom: 50rpx;
		background: linear-gradient(180deg, #FE7015 0%, #EB3B26 100%);
	}

	.merchantsSettled .list .item {
		padding: 28rpx 0 12px;
		position: relative;
		margin: 0 24rpx;

		&.no-border {
			border-bottom: none;
			padding-left: 0;
			padding-right: 0;
		}

		.item-title {
			color: #666666;
			font-size: 28rpx;
			display: block;
		}

		.item-desc {
			color: #B2B2B2;
			font-size: 22rpx;
			display: block;
			margin-top: 9rpx;
			line-height: 36rpx;
		}
	}

	.acea-row,
	.upload {
		display: -webkit-box;
		display: -moz-box;
		display: -webkit-flex;
		display: -ms-flexbox;
		display: flex;
		-webkit-box-lines: multiple;
		-moz-box-lines: multiple;
		-o-box-lines: multiple;
		-webkit-flex-wrap: wrap;
		-ms-flex-wrap: wrap;
		flex-wrap: wrap;
	}

	.upload {
		margin-top: 20rpx;
	}

	.merchantsSettled .list .item .pictrue {
		width: 130rpx;
		height: 130rpx;
		margin: 24rpx 22rpx 0 0;
		position: relative;
		font-size: 11px;
		color: #bbb;

		&:nth-child(4n) {
			margin-right: 0;
		}

		&:nth-last-child(1) {
			border: 0.5px solid #ddd;
			box-sizing: border-box;
		}

		uni-image,
		image {
			width: 100%;
			height: 100%;

			img {
				-webkit-touch-callout: none;
				-webkit-user-select: none;
				-moz-user-select: none;
				display: block;
				position: absolute;
				top: 0;
				left: 0;
				opacity: 0;
				width: 100%;
				height: 100%;
			}
		}

		.close-btn {
			background: #C6C6C6 !important;
			top: -12rpx !important;
			right: -10rpx !important;
		}
	}

	.uni-list-cell-db {
		position: relative;
	}

	.picker-value {
		width: 470rpx;
		font-size: 30rpx;
	}

	.picker-item .uni-list-cell {
		position: relative;
	}

	.store-picker-popup {
		background: #fff;
		border-radius: 24rpx 24rpx 0 0;
		overflow: hidden;
	}

	.store-picker-header {
		height: 96rpx;
		padding: 0 32rpx;
		border-bottom: 1rpx solid #eee;
	}

	.store-picker-title {
		font-size: 30rpx;
		color: #333;
		font-weight: bold;
	}

	.store-picker-action {
		width: 100rpx;
		font-size: 28rpx;
		color: #999;
	}

	.store-picker-list {
		max-height: 560rpx;
	}

	.store-picker-option {
		height: 88rpx;
		padding: 0 32rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 28rpx;
		color: #333;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.store-picker-empty {
		height: 160rpx;
		line-height: 160rpx;
		text-align: center;
		color: #999;
		font-size: 28rpx;
	}

	.store-picker-selected {
		@include main_color(theme);
		font-size: 24rpx;
	}

	.wenhao {
		width: 34rpx;
		height: 34rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		border-radius: 50%;
		background: #E3E3E3;
		color: #ffffff !important;
		margin-left: 4rpx;
		position: absolute;
		left: 122rpx;
	}

	.merchantsSettled .list .item .imageCode {
		position: absolute;
		top: 7px;
		right: 0;
	}

	.merchantsSettled .list .item .icon {
		font-size: 40rpx;
		color: #b4b1b4;
	}

	.merchantsSettled .list .item input {
		width: 470rpx;
		font-size: 30rpx;
	}

	.merchantsSettled .list .item .placeholder {
		color: #b2b2b2;
	}

	.merchantsSettled .default {
		padding: 0 30rpx;
		height: 90rpx;
		background-color: #fff;
		margin-top: 23rpx;
	}

	.merchantsSettled .default checkbox {
		margin-right: 15rpx;
	}

	.merchantsSettled .acea-row uni-image {
		// width: 20px;
		// height: 20px;
		display: block;
	}

	.merchantsSettled .list .item .codeIput {
		width: 125px;
	}

	.uni-input-input {
		display: block;
		height: 100%;
		background: none;
		color: inherit;
		opacity: 1;
		-webkit-text-fill-color: currentcolor;
		font: inherit;
		line-height: inherit;
		letter-spacing: inherit;
		text-align: inherit;
		text-indent: inherit;
		text-transform: inherit;
		text-shadow: inherit;
	}

	.merchantsSettled .list .item .code {
		position: absolute;
		width: 93px;
		line-height: 27px;
		@include coupons_border_color(theme);
		border-radius: 15px;
		@include main_color(theme);
		text-align: center;
		bottom: 8px;
		right: 0;
		font-size: 12px;
	}

	.merchantsSettled .list .item .code.on {
		color: #fff;
		border-color: #bbb;
	}

	.merchantsSettled .submitBtn {
		width: 588rpx;
		margin: 16rpx auto 0;
		height: 88rpx;
		border-radius: 50rpx;
		text-align: center;
		line-height: 88rpx;
		font-size: 28rpx;
		color: #fff;
		@include main_bg_color(theme);
	}

	.merchantsSettled .submitBtn.on {
		@include main_bg_color(theme);
	}

	uni-checkbox-group,
	.settleAgree {
		display: inline-block;
		font-size: 24rpx;
	}

	uni-checkbox-group {
		color: #b2b2b2 !important;
	}

	checkbox ::v-deep .uni-checkbox-input.uni-checkbox-input-checked {
		@include coupons_border_color(theme);
		//@include main_color(theme);
	}

	.settleAgree {
		@include main_color(theme);
	}

	.merchantsSettled uni-checkbox .uni-checkbox-wrapper {
		width: 30rpx;
		height: 30rpx;
		border: 2rpx solid #C3C3C3;
		border-radius: 15px;
	}

	.settlementAgreement {
		width: 100%;
		height: 100%;
		position: fixed;
		top: 0;
		left: 0;
		background: rgba(0, 0, 0, .5);
		z-index: 10;
	}

	.settlementAgreement .setAgCount {
		background: #fff;
		width: 656rpx;
		height: 1200rpx;
		position: absolute;
		top: 50%;
		left: 50%;
		border-radius: 32rpx;
		-webkit-border-radius: 32rpx;
		padding: 20rpx 52rpx !important;
		-webkit-transform: translate(-50%, -50%);
		-moz-transform: translate(-50%, -50%);
		transform: translate(-50%, -50%);
		overflow-y: scroll;

		.content {
			margin-top: 32rpx;
			color: #333;
			font-size: 26rpx;
			line-height: 22px;
			text-align: justify;
			text-justify: distribute-all-lines;
			height: 1070rpx;
			overflow-y: scroll;

			::v-deep p {
				font-size: 13px;
				line-height: 22px;
			}

			::v-deep img {
				max-width: 100%;
			}
		}
	}

	.settlementAgreement .setAgCount .icon {
		font-size: 24rpx;
		color: #b4b1b4;
		position: absolute;
		top: 40rpx;
		right: 15rpx;

	}

	.settlementAgreement .setAgCount .title {
		color: #333;
		font-size: 32rpx;
		text-align: center;
		font-weight: bold;
	}

	.settledSuccessMain {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: #fff;
	}

	.settledSuccessful {
		flex: 1;
		width: 100%;
		padding: 0 56px;
		height: auto;
		background: #fff;
		text-align: center;
	}

	.settledSuccessful .image {
		display: block;
		width: 189px;
		height: 157px;
		margin: 66px auto 0;
	}

	.settledSuccessful .title {
		color: #333333;
		font-size: 16px;
		font-weight: bold;
		margin-top: 35px;
	}

	.settledSuccessful .info {
		color: #A0A0A0;
		font-size: 13px;
		margin-top: 12px;
	}

	.settledSuccessful .goHome {
		margin: 60px auto 0;
		line-height: 43px;
		color: #282828;
		font-size: 15px;
		border: 1px solid #B4B4B4;
		border-radius: 60px;
	}

	::v-deep uni-checkbox .uni-checkbox-input {
		width: 36rpx;
		height: 36rpx;
		margin-right: 10rpx;
		position: relative;
		border-radius: 50%;
	}

	::v-deep uni-checkbox .uni-checkbox-input.uni-checkbox-input-checked:before {
		font-size: 14px;
	}

	.loadingicon {
		height: 100vh;
		overflow: hidden;
		position: absolute;
		top: 0;
		left: 0;
	}

	// #ifdef MP
	checkbox-group {
		display: inline-block;
	}

	// #endif
	.setAgCount {
		::v-deep table {
			border: 1rpx solid #DDD;
			border-bottom: none;
			border-right: none;
		}

		::v-deep td,
		th {
			padding: 5rpx 10rpx;
			border-bottom: 1rpx solid #DDD;
			border-right: 1rpx solid #DDD;
		}
	}

	.required::before {
		content: '* ';
		color: red;
		margin-right: 4rpx;
	}

	::v-deep .uni-input-input {
		width: 85%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap
	}

	.flex-shrink{
		flex-shrink: 0;
	}
	
	.wrap-text {
		word-wrap: break-word;
	}
	
	.width-470 {
		width: 470rpx;
	}
</style>
