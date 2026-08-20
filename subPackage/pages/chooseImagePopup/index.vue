<template>
	<view>
		<uni-popup ref="popup" type="bottom" @maskClick="closePopup">
			<view class="pop-box felx-column fs-32">
				<view class="select-box flex-column border-radius-6 mb-10">
					<view class="btn" @click="handleUpload('camera')">
						拍摄
					</view>
					<view class="btn" @click="handleUpload('album')">
						从相册中选择
					</view>
				</view>
				<view class="cancel-btn btn border-radius-6" @click="closePopup">
					取消
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import authorizeUtils from '@/utils/authorizeUtils.js'
	export default {
		name: 'chooseImagePopup',
		props: {
			uploadType: {
				type: String,
				default: ''
			},
			uploadUrlData: {
				type: Object,
				default: () => {}
			}
		},
		data() {
			return {}
		},
		methods: {
			// 图片选择方式弹窗
			openPopup() {
				this.$refs.popup.open()
			},
			// 关闭弹窗
			closePopup() {
				this.$refs.popup.close()
			},
			// 上传
			async handleUpload(openType){
				const permissionType = openType === "album" ? "android.permission.READ_EXTERNAL_STORAGE" : "android.permission.CAMERA";
				authorizeUtils.permissionRequest(
					permissionType,
					(permissionType) => {
						const that = this
						if (this.uploadType == 'image') {
							that.$util.uploadImageOne({
								sourceType: [openType],
								...this.uploadUrlData
							}, function(res) {
								that.closePopup()
								that.$emit('getUrl', res)
							});
						} else if (this.uploadType == 'video') {
							that.$util.uploadVideo({
								sourceType: [openType],
								...this.uploadUrlData
							}, function(res) {
								that.closePopup()
								that.$emit('getUrl', res)
							});
						}
					}
				)
			}
		}
	}
</script>

<style lang="scss">
.pop-box {
	margin: 0 8rpx 10rpx;
	.select-box {
		background-color: #fff;
	}
	.cancel-btn {
		background-color: #fff;
	}
	.btn {
		text-align: center;
	}
	.btn {
		padding: 10rpx 0;
		& + .btn {
			border-top: 1rpx solid #999;
		}
	}
}
.flex-column {
	display: flex;
	flex-direction: column;
}
.border-radius-6 {
	border-radius: 6rpx;
}
.fs-32 {
	font-size: 32rpx;
}
</style>