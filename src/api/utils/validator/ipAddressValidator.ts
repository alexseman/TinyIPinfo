export const ipV4Regex   = /^((25[0-5]|(2[0-4]|1[0-9]|[1-9]|)[0-9])(\.(?!$)|$)){4}$/;
export const isValidIpV4 = (ipAddress) => ipV4Regex.test(ipAddress);
