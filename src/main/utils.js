export const onMac = /^darwin/.test(process.platform);
export const onWindows = /^win/.test(process.platform);
export const isDev = /^dev/.test(process.env.NODE_ENV || "production");
