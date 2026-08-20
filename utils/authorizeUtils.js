import permision from "./permission.js"
class authorizeUtils {
	/**
	 * android端授权前告知用户使用意图
	 * @param content 
	 * @returns 
	 */
	
	static permissionRequest = async (authorize, successCallback) => {
		const {hasPermission, isAgreePopup} = await this.showAuthTipModal(authorize)
		if (hasPermission) {
			successCallback()
		} else {
			if (isAgreePopup) {
				const status = await permision.requestAndroid(authorize);
				if (status == 1) {
					successCallback()
				} else if (status == -1) {
					this.showManualAuth(authorize)
				}
			}
		}
	}
	
	static showAuthTipModal = async (authorize) => {
		let resData = {
			hasPermission: false, // 是否授权
			isAgreePopup: false // 是否同意授权，同意则拉起安卓权限请求弹窗
		}
		// #ifdef H5
		if (1 === 1) {
			return resData
		}
		// #endif
		// 导入 AndroidX 的 ContextCompat 类
		let compat = plus.android.importClass('androidx.core.content.ContextCompat')
		// 获取主 Activity 作为上下文
		let context = plus.android.runtimeMainActivity()
		// 检查指定权限的授权状态
		let result = compat.checkSelfPermission(context, authorize)
		resData.hasPermission = result
		// 如果已经授权直接返回
		if (result === 0) {
			resData.hasPermission = true
			return resData
		} else {
			resData.hasPermission = false
		}

		const contentData = {
			['android.permission.ACCESS_FINE_LOCATION']: {
				title: "定位权限说明",
				describe: "便于您使用该功能在定位商圈以及收货地址，请您确认授权，否则无法使用该功能"
			},
			["android.permission.READ_EXTERNAL_STORAGE"]: {
				title: "相册权限说明",
				describe: "便于您使用该功能上传您的图片/视频进行评论或逛逛帖子的发布以及头像修改等，请您确认授权，否则无法使用该功能"
			},
			["android.permission.CAMERA"]: {
				title: "拍摄权限说明",
				describe: "便于您使用该功能拍摄进行评论或逛逛帖子的发布以及头像修改等，请您确认授权，否则无法使用该功能"
			},
			["android.permission.CALL_PHONE"]: {
				title: "拨打电话权限说明",
				describe: "便于您使用该功能拨打客服电话，请您确认授权，否则无法使用该功能"
			},
		}
		return new Promise((resolve) => {
			uni.showModal({
				title: contentData[authorize].title,
				content: contentData[authorize].describe,
				success: (res) => {
					resData.isAgreePopup = !!res.confirm
					resolve(resData)
				},
				fail: () => {

				}
			})
		})
	}

	/**
	 * 用户拒绝授权提示手动授权
	 */
	static showManualAuth = async (authorize) => {
		const contentData = {
			['android.permission.ACCESS_FINE_LOCATION']: "获取定位权限失败，请手动打开授权或检查系统定位开关",
			["android.permission.READ_EXTERNAL_STORAGE"]: "获取相册权限失败，请手动打开授权",
			["android.permission.CAMERA"]: "获取拍摄权限失败，请手动打开授权",
			["android.permission.CALL_PHONE"]: "获取拨打电话权限失败，请手动打开授权",
		}
		uni.showModal({
			title: '提示',
			content: contentData[authorize],
			confirmText: "去设置",
			success: (res) => {
				if (res.confirm) {
					uni.openAppAuthorizeSetting({
						success(res) {
							console.log(res);
						}
					});
				}
				if (res.cancel) {
					console.log('用户点击取消');
				}
			}
		});
	}
}

export default authorizeUtils