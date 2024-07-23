// ** React Imports
import { useState, useEffect, Fragment } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CustomAvatar from 'src/@core/components/mui/avatar'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import { getInitials } from 'src/@core/utils/get-initials'
import Slider from '@mui/material/Slider'
import Backdrop from '@mui/material/Backdrop'
import CircularProgress from '@mui/material/CircularProgress'
import Tab from '@mui/material/Tab'

import { CallReceived, History, Casino, Send } from '@mui/icons-material';

import { QRCode } from 'react-qrcode-logo';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';

// ** MUI Imports
import Button from '@mui/material/Button'
import Icon from 'src/@core/components/icon'
import toast from 'react-hot-toast'
import authConfig from 'src/configs/auth'
import { useTheme } from '@mui/material/styles'

import { getAllWallets, getWalletBalance, getWalletNicknames, getCurrentWalletAddress, getCurrentWallet, getPrice, sendAmount, getTxsInMemory, getWalletBalanceReservedRewards, getXweWalletAllTxs, getChivesContacts, searchChivesContacts } from 'src/functions/ChivesWallets'
import { BalanceMinus, BalanceTimes } from 'src/functions/AoConnect/AoConnect'
import { GetArWalletAllTxs } from 'src/functions/Arweave'

// ** Third Party Import
import { useTranslation } from 'react-i18next'
import { formatHash, formatTimestamp } from 'src/configs/functions'

import { styled } from '@mui/material/styles'
import Footer from '../Layout/Footer'
import Header from '../Layout/Header'
import PinKeyboard from '../Layout/PinKeyboard'
import { useRouter } from 'next/router'

import { createTheme, ThemeProvider } from '@mui/material';

import Tabs from '@mui/material/Tabs';

const ContentWrapper = styled('main')(({ theme }) => ({
  flexGrow: 1,
  width: '100%',
  padding: theme.spacing(6),
  transition: 'padding .25s ease-in-out',
  [theme.breakpoints.down('sm')]: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4)
  }
}))

const Wallet = () => {
  // ** Hook
  const { t } = useTranslation()
  const router = useRouter()
  const theme = useTheme()

  const contentHeightFixed = {}

  const [pageModel, setPageModel] = useState<string>('MainWallet')
  const [HeaderHidden, setHeaderHidden] = useState<boolean>(false)
  const [FooterHidden, setFooterHidden] = useState<boolean>(false)
  const [LeftIcon, setLeftIcon] = useState<string>('material-symbols:menu-rounded')
  const [Title, setTitle] = useState<string>('Wallet')
  const [RightButtonText, setRightButtonText] = useState<string>('Edit')
  const [RightButtonIcon, setRightButtonIcon] = useState<string>('mdi:qrcode')
  const [chooseWallet, setChooseWallet] = useState<any>(null)
  const [currentWalletTxs, setCurrentWalletTxs] = useState<any>(null)
  const [searchContactkeyWord, setSearchContactkeyWord] = useState<string>('')
  const [contactsAll, setContactsAll] = useState<any>({})

  const [sendMoneyAddress, setSendMoneyAddress] = useState<any>({name: '联系人1', address: 'B7IT6nWYrkE7JDfSgIM_wiuRylP9W3Tagicl428m1gI'})
  const [sendMoneyAmount, setSendMoneyAmount] = useState<string>('')

  const [activeTab, setActiveTab] = useState<string>('AllTxs')

  const handleChangeActiveTab = (event: any, value: string) => {
    setActiveTab(value)
    console.log("handleChangeActiveTab", event)
  }

  const preventDefault = (e: any) => {
    e.preventDefault();
  };

  const disableScroll = () => {

    console.log("preventDefault", preventDefault)

    //document.body.style.overflow = 'hidden';
    //document.addEventListener('touchmove', preventDefault, { passive: false });
  };

  const enableScroll = () => {

    console.log("preventDefault", preventDefault)

    //document.body.style.overflow = '';
    //document.removeEventListener('touchmove', preventDefault);
  };

  useEffect(() => {
    
    disableScroll();

    return () => {
      
      enableScroll();
    };

  }, []);

  const handleWalletGoHome = () => {
    setRefreshWalletData(refreshWalletData+1)
    setPageModel('MainWallet')
    setLeftIcon('material-symbols:menu-rounded')
    setTitle(t('Wallet') as string)
    setRightButtonText(t('QR') as string)
  }
  
  const LeftIconOnClick = () => {
    switch(pageModel) {
      case 'ReceiveMoney':
        handleWalletGoHome()
        break
      case 'AllTxs':
        handleWalletGoHome()
        break
      case 'SendMoneySelectContact':
        handleWalletGoHome()
        break
      case 'SendMoneyInputAmount':
        handleWalletGoHome()
        break
      case 'MainWallet':
        router.push('/mywallet')
        break
    }
  }
  
  const RightButtonOnClick = () => {
    handleWalletGoHome()
  }
    
  const [getAllWalletsData, setGetAllWalletsData] = useState<any>([])
  const [getWalletNicknamesData, setGetWalletNicknamesData] = useState<any>({})
  const [refreshWalletData, setRefreshWalletData] = useState<number>(0)

  const [currentAddress, setCurrentAddress] = useState<string>("")
  const [currentBalance, setCurrentBalance] = useState<string>("")
  const [currentBalanceReservedRewards, setCurrentBalanceReservedRewards] = useState<string>("")
  const [currentTxsInMemory, setCurrentTxsInMemory] = useState<any>({})
  const [currentFee, setCurrentFee] = useState<number>(0)

  
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploadingButton, setUploadingButton] = useState<string>(`${t('Send')}`)
  const [isDisabledButton, setIsDisabledButton] = useState<boolean>(false)

  

  
  
  useEffect(() => {

    setHeaderHidden(false)
    setFooterHidden(false)
    setRightButtonIcon('mdi:qrcode')

    const currentAddressTemp = getCurrentWalletAddress()
    setCurrentAddress(String(currentAddressTemp))

    const getCurrentWalletTemp = getCurrentWallet()
    setChooseWallet(getCurrentWalletTemp)

    const myTask = () => {
      setRefreshWalletData(refreshWalletData+1);
    };
    const intervalId = setInterval(myTask, 2 * 60 * 1000);
    
    return () => clearInterval(intervalId);

  }, []);

  useEffect(() => {
    const contactsAll = getChivesContacts()
    setContactsAll(contactsAll)
  }, []);
  
  useEffect(() => {
    const processWallets = async () => {
      if(currentAddress && currentAddress.length == 43 && pageModel == 'MainWallet')  {
        const currentBalance = await getWalletBalance(currentAddress);
        setCurrentBalance(Number(currentBalance).toFixed(4))
        
        if(authConfig.tokenType == "XWE")  {
          const getTxsInMemoryData = await getTxsInMemory()
          setCurrentTxsInMemory(getTxsInMemoryData)
          const balanceReservedRewards = await getWalletBalanceReservedRewards(currentAddress)
          if(balanceReservedRewards) {
            setCurrentBalanceReservedRewards(balanceReservedRewards)
          }

          if(currentTxsInMemory && currentTxsInMemory['send'] && currentTxsInMemory['send'][currentAddress])  {
            const MinusBalance = BalanceMinus(Number(currentBalance) , Number(currentTxsInMemory['send'][currentAddress]))
            setCurrentBalance(Number(MinusBalance).toFixed(4))
          }

        }

      }

      if(currentAddress && currentAddress.length == 43 && pageModel == 'AllTxs')  {
        if(authConfig.tokenType == "AR")  {
          setIsDisabledButton(true)
          const allTxs = await GetArWalletAllTxs(currentAddress)
          if(allTxs)  {
            setCurrentWalletTxs(allTxs)
          }
          setIsDisabledButton(false)
        }
        if(authConfig.tokenType == "XWE")  {
          setIsDisabledButton(true)
          const allTxs = await getXweWalletAllTxs(currentAddress, activeTab, 0, 150)
          if(allTxs)  {
            setCurrentWalletTxs(allTxs)
          }
          setIsDisabledButton(false)
        }
      }

    };
    processWallets();
  }, [currentAddress, pageModel, activeTab])

  useEffect(() => {
    setTitle(getWalletNicknamesData[currentAddress] ?? 'Wallet')
  }, [getWalletNicknamesData, currentAddress]);

  useEffect(() => {
    setGetAllWalletsData(getAllWallets())
    setGetWalletNicknamesData(getWalletNicknames())
  }, [refreshWalletData])

  useEffect(() => {
    if(pageModel == "SendMoneyInputAmount") {
      const getPriceDataFunction = async () => {
        try {
          const getPriceData = await getPrice(50)
          setCurrentFee(Number(getPriceData))
        } catch (error) {
          console.error('SendMoneyInputAmount Error:', error);
        }
      }
      getPriceDataFunction()
    }
  }, [pageModel])

  const handleWalletCopyAddress = () => {
    navigator.clipboard.writeText(chooseWallet.data.arweave.key);
    toast.success(t('Copied success') as string, { duration: 1000, position: 'top-center' })
  }

  const handleAddressShare = () => {
    if (navigator.share) {
      navigator.share({
        title: t('Share Wallet Address') as string,
        text: `${t('Here is my wallet address') as string}: ${currentAddress}`,
        url: window.location.href,
      }).then(() => {
        console.log('Successful share');
      }).catch((error) => {
        console.log('Error sharing', error);
      });
    } else {
      console.log('Share not supported on this browser');
    }
  }

  const handleClickReceiveButton = () => {
    setPageModel('ReceiveMoney')
    setLeftIcon('mdi:arrow-left-thin')
    setTitle(t('Receive') as string)
    setRightButtonText(t('') as string)
    setRightButtonIcon('')
  }

  const handleClickAllTxsButton = () => {
    setPageModel('AllTxs')
    setLeftIcon('mdi:arrow-left-thin')
    setTitle(t('Wallet Txs') as string)
    setRightButtonText(t('') as string)
    setRightButtonIcon('')
  }

  const handleClickSendButton = () => {
    setPageModel('SendMoneySelectContact')
    setLeftIcon('mdi:arrow-left-thin')
    setTitle(t('Select Contact') as string)
    setRightButtonText(t('') as string)
    setRightButtonIcon('')
    setSendMoneyAddress(null)
  }

  const handleSelectAddress = (MoneyAddress: any) => {
    setSendMoneyAddress(MoneyAddress)
    setPageModel('SendMoneyInputAmount')
    setLeftIcon('mdi:arrow-left-thin')
    setTitle(t('Input Amount') as string)
    setRightButtonText(t('') as string)
    setRightButtonIcon('')
    setSendMoneyAmount('')
  }

  const handleWalletSendMoney = async () => {
    setIsDisabledButton(true)
    setUploadingButton(`${t('Submitting...')}`)
    const TxResult: any = await sendAmount(chooseWallet, sendMoneyAddress.address, String(sendMoneyAmount), [], 'inputData', "SubmitStatus", setUploadProgress);
    if(TxResult && TxResult.status == 800) {
      toast.error(TxResult.statusText, { duration: 2500 })
    }
    if(TxResult && TxResult.signature)  {
      toast.success(t("Successful Sent") as string, { duration: 2500 })
    }
    setIsDisabledButton(false)
    setUploadingButton(`${t('Send')}`)
    setSendMoneyAmount('')
    handleWalletGoHome()
    console.log("uploadProgress", uploadProgress)
  }

  const themeSlider = createTheme({
    components: {
      MuiSlider: {
        styleOverrides: {
          root: {
            color: theme.palette.primary.main,
          },
        },
      },
    },
  });

  return (
    <Fragment>
      <Header Hidden={HeaderHidden} LeftIcon={LeftIcon} LeftIconOnClick={LeftIconOnClick} Title={Title} RightButtonText={RightButtonText} RightButtonOnClick={RightButtonOnClick} RightButtonIcon={RightButtonIcon}/>

      <Box
        component="main"
        sx={{
          flex: 1,
          overflowY: 'auto',
          marginTop: '48px', // Adjust according to the height of the AppBar
          marginBottom: '56px', // Adjust according to the height of the Footer
        }}
      >
        <ContentWrapper
            className='layout-page-content'
            sx={{
                ...(contentHeightFixed && {
                overflow: 'hidden',
                '& > :first-of-type': { height: `calc(100% - 104px)` }
                })
            }}
            >
            
            {getAllWalletsData && pageModel == 'MainWallet' ?  
              <Grid container spacing={2}>
                <Grid item xs={12} sx={{height: '100%'}}>
                  <Grid container spacing={2}>
                    <Box p={2} textAlign="center" sx={{width: '100%'}}>
                      <CustomAvatar
                        skin='light'
                        color='primary'
                        sx={{ width: 60, height: 60, fontSize: '1.5rem', margin: 'auto' }}
                        src={'/images/logo/' + authConfig.tokenName + '.png'}
                      >
                      </CustomAvatar>
                      <Typography variant="h5" mt={6}>
                        {currentBalance} {authConfig.tokenName}
                      </Typography>
                      {currentTxsInMemory && currentTxsInMemory['receive'] && currentTxsInMemory['receive'][currentAddress] && (
                        <Typography variant="body1" component="div" sx={{ color: 'primary.main' }}>
                          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon icon='tdesign:plus' />
                            {currentTxsInMemory['receive'][currentAddress]} {authConfig.tokenName}
                          </Box>
                        </Typography>
                      )}
                      {currentTxsInMemory && currentTxsInMemory['send'] && currentTxsInMemory['send'][currentAddress] && (
                        <Typography variant="body1" component="div" sx={{ color: 'warning.main' }}>
                          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon icon='tdesign:minus' />
                            {currentTxsInMemory['send'][currentAddress]} {authConfig.tokenName}
                          </Box>
                        </Typography>
                      )}
                      {currentBalanceReservedRewards && Number(currentBalanceReservedRewards) > 0 && (
                        <Typography variant="body1" component="div" sx={{ color: 'info.main' }}>
                          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon icon='hugeicons:mining-02' />
                            {Number(currentBalanceReservedRewards).toFixed(4)} {authConfig.tokenName}
                          </Box>
                        </Typography>
                      )}

                      <Typography variant="h6" mt={2}>
                        {formatHash(currentAddress, 6)}
                      </Typography>
                      <Grid container spacing={4} justifyContent="center" mt={2}>
                        <Grid item sx={{mx: 2}}>
                          <IconButton onClick={()=>handleClickReceiveButton()}>
                            <CallReceived />
                          </IconButton>
                          <Typography onClick={()=>handleClickReceiveButton()}>{t('Receive') as string}</Typography>
                        </Grid>
                        <Grid item sx={{mx: 2}}>
                          <IconButton onClick={()=>handleClickAllTxsButton()}>
                            <History />
                          </IconButton>
                          <Typography onClick={()=>handleClickAllTxsButton()}>{t('Txs') as string}</Typography>
                        </Grid>
                        <Grid item sx={{mx: 2}}>
                          <IconButton>
                            <Casino />
                          </IconButton>
                          <Typography>{t('Lottery') as string}</Typography>
                        </Grid>
                        <Grid item sx={{mx: 2}}>
                          <IconButton onClick={()=> Number(currentBalance) > 0 && handleClickSendButton()}>
                            <Send />
                          </IconButton>
                          <Typography onClick={()=>Number(currentBalance) > 0 && handleClickSendButton()}>{t('Send') as string}</Typography>
                        </Grid>
                      </Grid>

                      <Fragment>
                        <Grid container spacing={2} sx={{mt: 4}}>

                          <Grid item xs={12} sx={{ py: 0 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1}}>
                                {t('My Assets') as string}
                              </Box>
                          </Grid>

                          <Grid item xs={12} sx={{ py: 0 }}>
                            <Card>
                              <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1}}>
                                <CustomAvatar
                                  skin='light'
                                  color={'primary'}
                                  sx={{ mr: 0, width: 43, height: 43 }}
                                  src={'/images/logo/' + authConfig.tokenName + '.png'}
                                >
                                </CustomAvatar>
                                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', ml: 1.5 }}>
                                  <Typography 
                                    sx={{ 
                                      color: 'text.primary',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      textAlign: 'left'
                                    }}
                                  >
                                    {formatHash(currentAddress, 8)}
                                  </Typography>
                                  <Box sx={{ display: 'flex' }}>
                                    <Typography 
                                      variant='body2' 
                                      sx={{ 
                                        color: `primary.dark`, 
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        flex: 1,
                                        textAlign: 'left'
                                      }}
                                    >
                                      {currentBalance}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box textAlign="right">
                                  <Typography variant='h6' sx={{ 
                                    color: `info.dark`,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    mr: 1
                                  }}>
                                    {currentBalance}
                                  </Typography>
                                </Box>
                              </Box>
                            </Card>
                          </Grid>
                          
                          {authConfig.tokenName && authConfig.tokenName == "AR" && (
                            <Grid item xs={12} sx={{ py: 0 }}>
                              <Card>
                                <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1}}>
                                  <CustomAvatar
                                    skin='light'
                                    color={'primary'}
                                    sx={{ mr: 0, width: 43, height: 43 }}
                                    src={'/images/logo/AO.png'}
                                  >
                                  </CustomAvatar>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', ml: 1.5 }}>
                                    <Typography 
                                      sx={{ 
                                        color: 'text.primary',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        textAlign: 'left'
                                      }}
                                    >
                                      {formatHash(currentAddress, 8)}
                                    </Typography>
                                    <Box sx={{ display: 'flex' }}>
                                      <Typography 
                                        variant='body2' 
                                        sx={{ 
                                          color: `primary.dark`, 
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                          flex: 1,
                                          textAlign: 'left'
                                        }}
                                      >
                                        {currentBalance}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box textAlign="right">
                                    <Typography variant='h6' sx={{ 
                                      color: `info.dark`,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      mr: 2
                                    }}>
                                      {currentBalance}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Card>
                            </Grid>

                          )}

                          <Grid item xs={12} sx={{ py: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1 }}>
                              <Button sx={{ textTransform: 'none', mt: 3, ml: 2 }} variant='text' startIcon={<Icon icon='mdi:add' />} onClick={() => { 
                                // 处理点击事件
                              }}>
                                {t('Add Assets') as string}
                              </Button>
                            </Box>
                          </Grid>


                        </Grid>
                      </Fragment>

                    </Box>
                  </Grid>
                </Grid>

              </Grid>
            :
              <Fragment></Fragment>
            }

            {pageModel == 'AllTxs' && ( 
              <Grid container spacing={0}>
                <Box
                  component='header'
                  sx={{
                    backgroundColor: 'background.paper',
                    width: '91%',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    top: -10,
                    position: 'fixed',
                    mt: '48px',
                    height: '48px'
                  }}
                >
                  <Tabs
                    value={activeTab}
                    onChange={handleChangeActiveTab}
                    aria-label="icon position tabs example"
                    sx={{ height: '48px', my: 0, py: 0}}
                  >
                    <Tab sx={{ textTransform: 'none', my: 0, py: 0}} value={'AllTxs'} icon={<Icon fontSize={20} icon='ant-design:transaction-outlined' />} iconPosition="start" label="All Txs" />
                    <Tab sx={{ textTransform: 'none', my: 0, py: 0}} value={'Sent'} icon={<Icon fontSize={20} icon='mdi:receipt-text-arrow-right' />} iconPosition="start" label="Sent" />
                    <Tab sx={{ textTransform: 'none', my: 0, py: 0}} value={'Received'} icon={<Icon fontSize={20} icon='mdi:receipt-text-arrow-left' />} iconPosition="start" label="Received" />
                  </Tabs>
                </Box>
                
                <Grid item xs={12} sx={{mt: '40px', height: 'calc(100% - 56px)'}}>
                    <Grid container spacing={2}>

                    {authConfig.tokenName && authConfig.tokenName == "AR" && currentWalletTxs && currentWalletTxs.edges.map((Tx: any, index: number) => {

                      return (
                        <Grid item xs={12} sx={{ py: 0 }} key={index}>
                          <Card>
                            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1}}>
                            <CustomAvatar
                              skin='light'
                              color={'primary'}
                              sx={{ mr: 0, width: 38, height: 38 }}
                              src={'/images/logo/AO.png'}
                            >
                            </CustomAvatar>
                            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', ml: 1.5 }}>
                                <Typography 
                                  sx={{ 
                                    color: 'text.primary',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    textAlign: 'left'
                                  }}
                                >
                                  {formatHash(Tx.node.recipient, 10)}
                                </Typography>
                                <Box sx={{ display: 'flex' }}>
                                  <Typography 
                                    variant='body2' 
                                    sx={{ 
                                      color: `primary.dark`, 
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      flex: 1,
                                      textAlign: 'left'
                                    }}
                                  >
                                    {formatTimestamp(Tx.node.block.timestamp)}
                                  </Typography>
                                </Box>
                              </Box>

                              <Box textAlign="right">
                                <Typography variant='h6' sx={{ 
                                  color: `info.dark`,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  mr: 2
                                }}>
                                  {Number(Tx.node.fee.ar).toFixed(2)}
                                </Typography>

                              </Box>
                            </Box>
                          </Card>
                        </Grid>
                      )
                    })}

                    {authConfig.tokenName && authConfig.tokenName == "XWE" && currentWalletTxs && currentWalletTxs.data.map((Tx: any, index: number) => {

                      return (
                        <Grid item xs={12} sx={{ py: 0 }} key={index}>
                          <Card>
                            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1}}>
                            <CustomAvatar
                              skin='light'
                              color={'primary'}
                              sx={{ mr: 0, width: 38, height: 38 }}
                              src={'/images/logo/XWE.png'}
                            >
                            </CustomAvatar>
                            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', ml: 1.5 }} onClick={()=>{
                              navigator.clipboard.writeText(Tx.owner.address == currentAddress ? Tx.recipient : Tx.owner.address)
                              toast.success(t('Copied success') as string, { duration: 1000, position: 'top-center' })
                            }}>
                                <Typography 
                                  sx={{ 
                                    color: 'text.primary',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    textAlign: 'left'
                                  }}
                                >
                                  {Tx.owner.address == currentAddress ? formatHash(Tx.recipient, 8) : formatHash(Tx.owner.address, 8)}
                                </Typography>
                                <Box sx={{ display: 'flex' }}>
                                  <Typography 
                                    variant='body2' 
                                    sx={{ 
                                      color: `primary.dark`, 
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      flex: 1,
                                      textAlign: 'left'
                                    }}
                                  >
                                    {formatTimestamp(Tx.block.timestamp)}
                                  </Typography>
                                </Box>
                              </Box>

                              <Box textAlign="right">
                                <Typography variant='h6' sx={{ 
                                  color: `info.dark`,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  mr: 2
                                }}>
                                  {Tx.owner.address == currentAddress ? ' - ' : ' + '}
                                  {Number(Tx.quantity.xwe).toFixed(2)}
                                </Typography>

                              </Box>
                            </Box>
                          </Card>
                        </Grid>
                      )
                    })}

                    {authConfig.tokenName && authConfig.tokenName == "XWE" && currentWalletTxs && currentWalletTxs.data && currentWalletTxs.data.length == 0 && (
                      <Grid item xs={12} sx={{ py: 0 }}>
                        <Box sx={{ justifyContent: 'center', display: 'flex', alignItems: 'center', px: 2, py: 1}}>
                          {t('No Record')}
                        </Box>
                      </Grid>
                    )}
                    
                    </Grid>

                </Grid>
                      
                <Backdrop
                  sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                  open={isDisabledButton}
                >
                  <CircularProgress color="inherit" size={45}/>
                </Backdrop>

              </Grid>
            )}

            {pageModel == 'ReceiveMoney' && ( 
              <Grid container direction="column" alignItems="center" justifyContent="center" spacing={2} sx={{ minHeight: '100%', p: 2 }}>
                <Grid item>
                  <QRCode value={currentAddress} size={180} />
                </Grid>
                <Grid item>
                  <Typography variant="body1" sx={{mt: 3, wordWrap: 'break-word', wordBreak: 'break-all', textAlign: 'center', maxWidth: '100%', fontSize: '0.8125rem !important' }}>
                    {currentAddress}
                  </Typography>
                </Grid>
                <Grid item>
                  <Button variant="outlined" sx={{mt: 3}} startIcon={<ContentCopyIcon />} onClick={()=>handleWalletCopyAddress()}>
                    {t('Copy') as string}
                  </Button>
                </Grid>
                <Grid item sx={{ mt: 8, width: '100%' }}>
                  <Button variant="contained" startIcon={<ShareIcon />} fullWidth onClick={()=>handleAddressShare()}>
                  {t('Share') as string}
                  </Button>
                </Grid>
              </Grid>
            )}

            {pageModel == 'SendMoneySelectContact' && ( 
              <Grid container spacing={2}>
                <Grid item xs={12} sx={{height: 'calc(100%)'}}>
                    <Grid container spacing={2}>
                      <TextField
                        fullWidth
                        size='small'
                        value={searchContactkeyWord}
                        placeholder={t('Search or Input Address') as string}
                        sx={{ '& .MuiInputBase-root': { borderRadius: 5 }, mb: 3 }}
                        onChange={(e: any)=>{
                          setSearchContactkeyWord(e.target.value)
                          const searchChivesContactsData = searchChivesContacts(e.target.value)
                          setContactsAll(searchChivesContactsData)
                          console.log("e.target.value", e.target.value)
                        }}
                      />
                    </Grid>
                    <Grid container spacing={2}>
                    {Object.keys(contactsAll).map((Address: any, index: number) => {

                      return (
                        <Grid item xs={12} sx={{ py: 1 }} key={index}>
                          <Card>
                            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 0.7}}>
                              <CustomAvatar
                                skin='light'
                                color={'primary'}
                                sx={{ mr: 3, width: 38, height: 38, fontSize: '1.5rem' }}
                              >
                                {getInitials(Address).toUpperCase()}
                              </CustomAvatar>
                              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }} onClick={()=>handleSelectAddress({name: contactsAll[Address], address: Address})}
                                >
                                <Typography sx={{ 
                                  color: 'text.primary',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                                >
                                  {contactsAll[Address]}
                                </Typography>
                                <Box sx={{ display: 'flex'}}>
                                  <Typography variant='body2' sx={{ 
                                    color: `primary.dark`, 
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    flex: 1
                                  }}>
                                    {formatHash(Address, 10)}
                                  </Typography>
                                  
                                </Box>
                              </Box>
                            </Box>
                          </Card>
                        </Grid>
                      )

                    })}
                    </Grid>

                </Grid>
              </Grid>
            )}

            {pageModel == 'SendMoneyInputAmount' && sendMoneyAddress && ( 
              <Grid container spacing={2}>
                <Grid item xs={12} sx={{height: 'calc(100% - 100px)'}}>
                    <Grid item xs={12} sx={{ py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', px: 0}}>
                          <CustomAvatar
                            skin='light'
                            color={'primary'}
                            sx={{ mr: 2, width: 38, height: 38, fontSize: '1.5rem' }}
                          >
                            {getInitials(sendMoneyAddress.address).toUpperCase()}
                          </CustomAvatar>
                          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}
                            >
                            <Typography sx={{ 
                              color: 'text.primary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            >
                              {sendMoneyAddress.name}
                            </Typography>
                            <Box sx={{ display: 'flex'}}>
                              <Typography variant='body2' sx={{ 
                                color: `primary.dark`, 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                flex: 1
                              }}>
                                {formatHash(sendMoneyAddress.address, 10)}
                              </Typography>
                              
                            </Box>
                          </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sx={{ py: 1 }}>
                      <TextField
                        disabled={isDisabledButton}
                        fullWidth
                        size='small'
                        value={sendMoneyAmount}
                        onChange={(e) => {
                          const value = e.target.value;
                          const regex = /^[0-9]*\.?[0-9]*$/;
                          if (regex.test(value)) {
                            setSendMoneyAmount(value);
                          }
                        }}
                        placeholder={t('Amount') as string}
                        sx={{ '& .MuiInputBase-root': { borderRadius: 5 }, mt: 2 }}
                      />
                      <ThemeProvider theme={themeSlider}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 0, py: 0 }}>
                          <Slider size="small" 
                                disabled={isDisabledButton}
                                defaultValue={0} 
                                aria-labelledby="small-slider" 
                                min={0}
                                max={100}
                                onChange={( _ , newValue: number | number[])=>{
                                  if (Array.isArray(newValue)) {
                                    newValue = newValue[0];
                                  }
                                  const TotalLeft = BalanceMinus(Number(currentBalance), Number(currentFee))
                                  const MultiValue = newValue / 100
                                  const result = BalanceTimes(Number(TotalLeft), MultiValue)
                                  if(newValue == 100) {
                                    setSendMoneyAmount( String(Number(result)) )

                                  }
                                  else {
                                    setSendMoneyAmount( String(Number(result).toFixed(4)) )
                                  }
                                }} 
                                sx={{m: 0, p: 0, width: '90%' }}
                                />
                        </Box>
                      </ThemeProvider>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1.2, ml: 3 }}>
                        {t('Max')}: {currentBalance} {authConfig.tokenName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1.2, ml: 3 }}>
                        {t('Fee')}: {currentFee}
                      </Typography>
                  </Grid>
                  <Grid item xs={12} sx={{ py: 1 }}>
                    <Box sx={{width: '100%', mr: 2}}>
                      <Button sx={{mt: 8}} fullWidth disabled={
                        (sendMoneyAddress && sendMoneyAddress.address && currentFee && Number(sendMoneyAmount) > 0 && (Number(currentFee) + Number(sendMoneyAmount)) < Number(currentBalance) ? false : true)
                        ||
                        (isDisabledButton)                  
                        } variant='contained' onClick={()=>handleWalletSendMoney()}>
                        {uploadingButton}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
                      
                <Backdrop
                  sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                  open={isDisabledButton}
                >
                  <CircularProgress color="inherit" size={45}/>
                </Backdrop>
                
              </Grid>
            )}

            {pageModel == 'PinCode' && ( 
              <Grid container spacing={6}>
                <Grid item xs={12}>
                  <PinKeyboard />
                </Grid>
              </Grid>
            )}

        </ContentWrapper>
      </Box>
      <Footer Hidden={FooterHidden} />
    </Fragment>
  )
}

export default Wallet
