// ** React Imports
import { useState, useEffect, Fragment } from 'react'

import { validateMnemonic } from 'bip39-web-crypto';

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'
import Typography, { TypographyProps } from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { getInitials } from 'src/@core/utils/get-initials'
import IconButton from '@mui/material/IconButton'
import Drawer from '@mui/material/Drawer'
import CircularProgress from '@mui/material/CircularProgress'

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'

// ** MUI Imports
import Button from '@mui/material/Button'
import Icon from 'src/@core/components/icon'
import toast from 'react-hot-toast'
import TextField2 from 'src/views/Layout/TextField2'
import { useDropzone } from 'react-dropzone'

import { getAllWallets, getWalletBalance, setWalletNickname, getWalletNicknames, downloadTextFile, removePunctuation, deleteWalletByWallet, setCurrentWallet, getChivesLanguage, generateArWallet12MnemonicData, importWalletJsonFile, readFileText, jwkFromMnemonic } from 'src/functions/ChivesWallets'

// ** Third Party Import
import { useTranslation } from 'react-i18next'
import { formatHash } from 'src/configs/functions'

import { styled } from '@mui/material/styles'
import Header from '../Layout/Header'
import CheckPinKeyboard from '../Layout/CheckPinKeyboard'

import { getAccountByMnemonicXcc } from 'src/functions/ChivesCoin'

import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import Rollbar from "rollbar"

const rollbarConfig = {
  accessToken: "500d22dec90f4b8c8adeeeaad8e789c0",
  environment: "production",
};

const rollbar = new Rollbar(rollbarConfig);

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

const MyWallet = ({ currentToken, setCurrentTab, encryptWalletDataKey, setDisabledFooter } : any) => {
  // ** Hook
  const { t, i18n } = useTranslation()

  const contentHeightFixed = {}

  const [model, setModel] = useState<string>('View')
  const [pageModel, setPageModel] = useState<string>('ListWallet')
  const [bottomMenus, setBottomMenus] = useState<any>([])
  const [HeaderHidden, setHeaderHidden] = useState<boolean>(false)
  const [LeftIcon, setLeftIcon] = useState<string>('material-symbols:menu-open')
  const [Title, setTitle] = useState<string>('My Wallet')
  const [RightButtonText, setRightButtonText] = useState<string>(t('Edit') as string)
  const [drawerStatus, setDrawerStatus] = useState<boolean>(false)
  const [chooseWallet, setChooseWallet] = useState<any>(null)
  const [chooseWalletName, setChooseWalletName] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [importKeyValue, setImportKeyValue] = useState<string>("")
  const [importMnemonicValue, setImportMnemonicValue] = useState<string>("")


  const handleWalletGoHome = () => {
    setModel('View')
    setRefreshWalletData(refreshWalletData+1)
    setPageModel('ListWallet')
    setLeftIcon('material-symbols:menu-open')
    setTitle(t('My Wallet') as string)
    setRightButtonText(t('Edit') as string)
  }

  const LeftIconOnClick = () => {
    if(pageModel != 'ListWallet') {
      handleWalletGoHome()
    }
    else {
      setCurrentTab('Wallet')
    }
  }

  const RightButtonOnClick = () => {
    if(model == 'View')   {
      setModel('Edit')
      setRightButtonText(t('Finished') as string)
    }
    else {
      setModel('View')
      setRightButtonText(t('Edit') as string)
      setRefreshWalletData(refreshWalletData+1)
      setPageModel('ListWallet')
    }
  }

  const [walletBalanceMap, setWalletBalanceMap] = useState<any>({})
  const [getAllWalletsData, setGetAllWalletsData] = useState<any>([])
  const [getWalletNicknamesData, setGetWalletNicknamesData] = useState<any>({})
  const [open, setOpen] = useState<boolean>(false)
  const [refreshWalletData, setRefreshWalletData] = useState<number>(0)

  useEffect(() => {

    i18n.changeLanguage(getChivesLanguage())

    setHeaderHidden(false)

    const myTask = () => {
      setRefreshWalletData(refreshWalletData+1);
    };

    const intervalId = setInterval(myTask, 2 * 60 * 1000);

    return () => clearInterval(intervalId);

  }, []);

  useEffect(() => {
    const getAllWalletsData = getAllWallets(encryptWalletDataKey)
    if(getAllWalletsData == null || getAllWalletsData.length == 0)  {

      //No wallet, and create one
      handleWalletCreate()
    }
    else {
      setDisabledFooter(false)

      //Have wallets, and list them
      setGetAllWalletsData(getAllWallets(encryptWalletDataKey))
      setGetWalletNicknamesData(getWalletNicknames(encryptWalletDataKey))
    }

  }, [refreshWalletData])

  useEffect(() => {
    const walletBalanceMapItem: any = {}
    const processWallets = async () => {
      await Promise.all(getAllWalletsData.map(async (wallet: any) => {
        const currentBalance = await getWalletBalance(wallet.data.arweave.key, currentToken);
        walletBalanceMapItem[wallet.data.arweave.key] = currentBalance
      }));
      setWalletBalanceMap(walletBalanceMapItem)
    };
    processWallets();
    console.log("getAllWalletsData", getAllWalletsData)
  }, [getAllWalletsData])

  const handleOpenWalletMenu = (wallet: any) => {
    setChooseWallet(wallet)
    const bottomMenusList: any[] = []
    bottomMenusList.push({icon: 'material-symbols:copy-all-outline', title: t('Copy Address'), function: 'handleWalletCopyAddress'})
    bottomMenusList.push({icon: 'material-symbols:edit-outline', title: t('Rename Wallet'), function: 'handleWalletRename'})
    bottomMenusList.push({icon: 'mdi:file-export-outline', title: t('Export Key'), function: 'handleWalletExportKey'})
    bottomMenusList.push({icon: 'material-symbols:delete-outline', title: t('Delete Wallet'), color: 'rgb(255, 76, 81)', function: 'handleWalletDelete'})
    setBottomMenus(bottomMenusList)
    setDrawerStatus(true)
  }

  const handleCreateWalletMenu = () => {
    const bottomMenusList: any[] = []
    bottomMenusList.push({icon: 'material-symbols:add', title: t('Add Wallet'), function: 'handleWalletCreate'})
    bottomMenusList.push({icon: 'mdi:code-json', title: t('Import Mnemonic'), function: 'handleWalletMnemonic'})
    bottomMenusList.push({icon: 'mdi:code-json', title: t('Import Key'), function: 'handleWalletImportKey'})
    bottomMenusList.push({icon: 'material-symbols:download-sharp', title: t('Import Json File'), function: 'handleWalletImportJsonFile'})
    setBottomMenus(bottomMenusList)
    setDrawerStatus(true)
  }

  const handleSetCurrentWallet = (wallet: any) => {
    setCurrentWallet(wallet.data.arweave.key, encryptWalletDataKey)
    setCurrentTab('Wallet')
  }

  const handleWalletCreateMenu = () => {
    handleCreateWalletMenu()
  }

  const handleWalletCreate = () => {
    setChooseWalletName('')
    setPageModel('CreateWallet')
    setLeftIcon('ic:twotone-keyboard-arrow-left')
    setTitle(t('Create Wallet') as string)
    setRightButtonText('')
  }

  const handleWalletMnemonic = () => {
    setPageModel('ImportMnemonic')
    setLeftIcon('mdi:code-json')
    setTitle(t('Import Mnemonic') as string)
    setRightButtonText('')
  }

  const handleWalletImportKey = () => {
    setPageModel('ImportKey')
    setLeftIcon('mdi:code-json')
    setTitle(t('Import Key') as string)
    setRightButtonText('')
  }

  const handleWalletImportJsonFile = () => {
    setPageModel('ImportJsonFile')
    setLeftIcon('ic:twotone-keyboard-arrow-left')
    setTitle(t('Import Json File') as string)
    setRightButtonText('')
  }

  const handleWalletCreateWalletData = async () => {
    setIsLoading(true)
    const ImportJsonFileWalletAddress: any = await generateArWallet12MnemonicData(encryptWalletDataKey)
    if(ImportJsonFileWalletAddress && ImportJsonFileWalletAddress.length == 43) {
        setWalletNickname(ImportJsonFileWalletAddress, chooseWalletName, encryptWalletDataKey)
        setChooseWalletName('')
        setImportKeyValue('')
        handleWalletGoHome()
    }
    setIsLoading(false)
  }

  const handleWalletImportMnemonicData = async () => {
    try {
      const validateMnemonicData = await validateMnemonic(importMnemonicValue)
      if(!validateMnemonicData) {
        toast.error(t('Mnemonic is invalid') as string, { duration: 2500, position: 'top-center' })
      }
      else {
        setIsLoading(true)
        const ImportWallet = await jwkFromMnemonic(importMnemonicValue)
        console.log("importMnemonicValue", importMnemonicValue, ImportWallet)
        if(ImportWallet)  {
          const IsExist = getAllWalletsData.filter((wallet: any) => wallet.jwk.n == ImportWallet.n)
          if(IsExist && IsExist.length > 0)  {
            setChooseWalletName('')
            setImportMnemonicValue('')
            handleWalletGoHome()
            toast.error(t('Wallet exist, not need import again') as string, { duration: 2500, position: 'top-center' })
          }
          else {
            const xcc = await getAccountByMnemonicXcc(importMnemonicValue, 50)
            console.log("getAccountData xcc", xcc)
            const ImportJsonFileWalletAddress = await importWalletJsonFile(ImportWallet, encryptWalletDataKey, importMnemonicValue, xcc)
            if(ImportJsonFileWalletAddress && ImportJsonFileWalletAddress.length == 43) {
                setWalletNickname(ImportJsonFileWalletAddress, chooseWalletName, encryptWalletDataKey)
                setChooseWalletName('')
                setImportMnemonicValue('')
                handleWalletGoHome()
            }
          }
        }
        else {
          toast.error(t('Import mnemonic invalid') as string, { duration: 2500, position: 'top-center' })
        }
        setIsLoading(false)
      }
    }
    catch(e: any) {
      toast.error(t('Import mnemonic failed') as string, { duration: 2500, position: 'top-center' })
      setIsLoading(false)
    }
  }

  const handleWalletImportKeyData = async () => {
    try {
      const ImportWallet = JSON.parse(importKeyValue)
      const IsExist = getAllWalletsData.filter((wallet: any) => wallet.jwk.n == ImportWallet.n)
      if(IsExist && IsExist.length > 0)  {
        setChooseWalletName('')
        setImportKeyValue('')
        handleWalletGoHome()
        toast.error(t('Wallet exist, not need import again') as string, { duration: 2500, position: 'top-center' })
      }
      else {
        const ImportJsonFileWalletAddress = await importWalletJsonFile(ImportWallet, encryptWalletDataKey, '', null)
        if(ImportJsonFileWalletAddress && ImportJsonFileWalletAddress.length == 43) {
            setWalletNickname(ImportJsonFileWalletAddress, chooseWalletName, encryptWalletDataKey)
            setChooseWalletName('')
            setImportKeyValue('')
            handleWalletGoHome()
        }
      }
    }
    catch(e: any) {
      toast.error(t('Import key failed') as string, { duration: 2500, position: 'top-center' })
    }
  }

  const handleWalletCopyAddress = () => {
    console.log("handleWalletCopyAddress", chooseWallet.data.arweave.key)
    navigator.clipboard.writeText(chooseWallet.data.arweave.key);
    toast.success(t('Copied success') as string, { duration: 1000, position: 'top-center' })
  }

  const handleWalletRename = () => {
    setPageModel('RenameWallet')
    chooseWallet && setChooseWalletName(getWalletNicknamesData[chooseWallet.data.arweave.key] ?? 'My Wallet')
    setLeftIcon('ic:twotone-keyboard-arrow-left')
    setTitle(t('Rename Wallet') as string)
    setRightButtonText('')
  }

  const handleWalletRenameSave = () => {
    setWalletNickname(chooseWallet.data.arweave.key, chooseWalletName, encryptWalletDataKey);
    console.log("chooseWalletName", chooseWalletName);
    setRefreshWalletData(refreshWalletData+1)
    handleWalletGoHome()
  };

  const handleWalletExportKeyShow = () => {
    setPageModel('ExportKeyShow')
    setLeftIcon('ic:twotone-keyboard-arrow-left')
    setTitle(t('Show Key') as string)
    setRightButtonText('')
  }

  const handleWalletExportKeyHidden = () => {
    setPageModel('ExportKeyHidden')
    setLeftIcon('ic:twotone-keyboard-arrow-left')
    setTitle(t('Hidden Key') as string)
    setRightButtonText('')
  }

  const handleWalletDelete = async () => {
    setOpen(true);
    setPageModel('DeleteWallet')
  }

  const handleClickToExport = async () => {
    const Address = chooseWallet.data.arweave.key
    const fileName = "chivesweave_keyfile_" + Address + "____" + removePunctuation(getWalletNicknamesData[Address]) + ".json";
    const mimeType = "text/plain";

    const platform = Capacitor.getPlatform();

    if (platform === 'android') {
      console.log('当前平台是 Android');
      try {
        await Filesystem.writeFile({
          path: fileName,
          data: JSON.stringify(chooseWallet.jwk),
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        console.log('文件保存成功');
      } catch (error) {
        console.error('文件保存失败', error);
        rollbar.error("文件保存失败", error as Error);
      }
    }
    else if (platform === 'ios') {
      console.log('当前平台是 iOS');
      try {
        await Filesystem.writeFile({
          path: fileName,
          data: JSON.stringify(chooseWallet.jwk),
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        console.log('文件保存成功');
      } catch (error) {
        console.error('文件保存失败', error);
        rollbar.error("文件保存失败", error as Error);
      }
    }
    else if (platform === 'web') {
      console.log('当前平台是 Web');
      downloadTextFile(JSON.stringify(chooseWallet.jwk), fileName, mimeType);
    }

  };

  const handleNoClose = () => {
    setOpen(false)
    setPageModel('ListWallet')
  }

  const handleYesClose = () => {
    setOpen(false)
    deleteWalletByWallet(chooseWallet.jwk, encryptWalletDataKey)
    setRefreshWalletData(refreshWalletData+1)
    setPageModel('ListWallet')
  }

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      'application/json': ['.json']
    },
    onDrop: (acceptedFiles: File[]) => {
        acceptedFiles.map((file: File) => {
            handleImportWalletJsonFile(file)
        })
    }
  })

  const handleImportWalletJsonFile = async (file: File) => {
    const jsonFileContent: string = await readFileText(file)
    const ImportJsonFileWalletAddress = await importWalletJsonFile(JSON.parse(jsonFileContent), encryptWalletDataKey, '', null)

    if(ImportJsonFileWalletAddress && ImportJsonFileWalletAddress.length == 43) {
        setWalletNickname(ImportJsonFileWalletAddress, ImportJsonFileWalletAddress.slice(0, 6), encryptWalletDataKey)
        handleWalletGoHome()
        toast.success(t('Import Json Files Success') as string, { duration: 1000, position: 'top-center' })
    }
    else {
      toast.error(t('Import Json Files Failed') as string, { duration: 2500, position: 'top-center' })
      handleWalletGoHome()
    }
  };

  const HeadingTypography = styled(Typography)<TypographyProps>(({ theme }) => ({
    marginBottom: theme.spacing(5),
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(4)
    }
  }))

  const Img = styled('img')(({ theme }) => ({
    [theme.breakpoints.up('md')]: {
      marginRight: theme.spacing(15.75)
    },
    [theme.breakpoints.down('md')]: {
      marginBottom: theme.spacing(4)
    },
    [theme.breakpoints.down('sm')]: {
      width: 160
    }
  }))


  return (
    <Fragment>
      <Header Hidden={HeaderHidden} LeftIcon={LeftIcon} LeftIconOnClick={LeftIconOnClick} Title={Title} RightButtonText={RightButtonText} RightButtonOnClick={RightButtonOnClick} />

      <Box
        component="main"
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          marginTop: '35px', // Adjust according to the height of the AppBar
          marginBottom: '56px', // Adjust according to the height of the Footer
          paddingTop: 'env(safe-area-inset-top)'
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

          {pageModel == 'DeleteWallet' ?
          <Fragment>
              <Dialog
                  open={open}
                  disableEscapeKeyDown
                  aria-labelledby='alert-dialog-title'
                  aria-describedby='alert-dialog-description'
                  >
                  <DialogTitle id='alert-dialog-title'>{`${t(`Are you deleting your wallet?`)}`}</DialogTitle>
                  <DialogContent>
                      <DialogContentText id='alert-dialog-description'>
                      {`${t(`Once this wallet is deleted, it cannot be restored.`)}`}
                      {`${t(`Do you want delete this wallet`)}`} {formatHash(chooseWallet.data.arweave.key, 5)} ?
                      </DialogContentText>
                  </DialogContent>
                  <DialogActions className='dialog-actions-dense'>
                      <Button onClick={handleNoClose} color="error" size='small' variant='contained' >{`${t(`No`)}`}</Button>
                      <Button onClick={handleYesClose} color="primary">{`${t(`Yes`)}`}</Button>
                  </DialogActions>
              </Dialog>
          </Fragment>
          :
          <Fragment></Fragment>
          }

          {getAllWalletsData && pageModel == 'ListWallet' ?
            <Grid container spacing={2}>
              <Grid item xs={12} sx={{height: 'calc(100%)'}}>
                  <Grid container spacing={2}>
                    {getAllWalletsData.map((wallet: any, index: number) => {

                      return (
                        <Grid item xs={12} sx={{ py: 0 }} key={index}>
                          <Card>
                            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1}}>
                              <CustomAvatar
                                skin='light'
                                color={'primary'}
                                sx={{ mr: 3, width: 38, height: 38, fontSize: '1.5rem' }}
                              >
                                {getInitials(wallet.data.arweave.key).toUpperCase()}
                              </CustomAvatar>
                              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }} onClick={()=>handleSetCurrentWallet(wallet)}
                                >
                                <Typography sx={{
                                  color: 'text.primary',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                                >
                                  {getWalletNicknamesData[wallet.data.arweave.key] ?? 'My Wallet'}
                                </Typography>
                                <Box sx={{ display: 'flex'}}>
                                  <Typography variant='body2' sx={{
                                    color: `primary.dark`,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    flex: 1
                                  }}>
                                    {formatHash(wallet.data.arweave.key, 5)} {currentToken}
                                  </Typography>

                                </Box>
                              </Box>
                              <Box textAlign="right">
                                {model == 'View' && (
                                  <Typography variant='h6' sx={{
                                    color: Number(walletBalanceMap[wallet.data.arweave.key]) > 0 ? 'info.dark' : 'secondary.dark',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    mr: 2
                                  }}>
                                    {Number(walletBalanceMap[wallet.data.arweave.key]) > 0 ? Number(walletBalanceMap[wallet.data.arweave.key]).toFixed(2) : '0'}
                                  </Typography>
                                )}
                                {model == 'Edit' && (
                                  <IconButton sx={{ p: 1 }} onClick={()=>handleOpenWalletMenu(wallet)}>
                                    <Icon icon='mdi:dots-vertical' fontSize={20} />
                                  </IconButton>
                                )}

                              </Box>
                            </Box>
                          </Card>
                        </Grid>
                      )

                    })}

                    {model == 'Edit' && (
                      <Grid item xs={12} sx={{ py: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%'}}>
                            <Button sx={{mt: 4}} fullWidth variant='contained' onClick={()=>handleWalletCreateMenu()}>
                              {t("Create Wallet")}
                            </Button>
                          </Box>
                      </Grid>
                    )}

                  </Grid>
              </Grid>

              <Drawer
                anchor={'bottom'}
                open={drawerStatus}
                onClose={()=>setDrawerStatus(false)}
              >
                <Box
                  sx={{ width: 'auto' }}
                  role="presentation"
                  onClick={()=>setDrawerStatus(false)}
                  onKeyDown={()=>setDrawerStatus(false)}
                >
                  <List>
                    {bottomMenus.map((menu: any, index: number) => (
                      <ListItem key={index} disablePadding onClick={()=>{
                        switch(menu.function) {
                          case 'handleWalletCopyAddress':
                            handleWalletCopyAddress();
                            break;
                          case 'handleWalletRename':
                            handleWalletRename();
                            break;
                          case 'handleWalletExportKey':
                            handleWalletExportKeyHidden();
                            break;
                          case 'handleWalletDelete':
                            handleWalletDelete();
                            break;
                          case 'handleWalletCreate':
                            handleWalletCreate();
                            break;
                          case 'handleWalletMnemonic':
                            handleWalletMnemonic();
                            break;
                          case 'handleWalletImportKey':
                            handleWalletImportKey();
                            break;
                          case 'handleWalletImportJsonFile':
                            handleWalletImportJsonFile();
                            break;
                        }
                      }}>
                        <ListItemButton>
                          <ListItemIcon>
                            <Icon icon={menu.icon} fontSize={20} color={menu?.color && menu?.color != '' && 'rgb(255, 76, 81)'}/>
                          </ListItemIcon>
                          <ListItemText primary={menu.title} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Drawer>
            </Grid>
          :
            <Fragment></Fragment>
          }

          {pageModel == 'CreateWallet' && (
            <Grid container spacing={2}>

              {isLoading ?
              <Fragment>
                <Grid container spacing={5}>
                    <Grid item xs={12}>
                        <Box sx={{ mt: 10, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                            <CircularProgress sx={{ mb: 4 }} />
                            <Typography sx={{mt: 3}}>{`${t(`Create a new wallet, please wait`)}`} ...</Typography>
                        </Box>
                    </Grid>
                </Grid>
              </Fragment>
              :
              <Fragment>
                <Grid item xs={12} sx={{height: '100%'}}>
                  <Grid container spacing={2}>
                    <TextField
                      fullWidth
                      size='small'
                      value={chooseWalletName}
                      onChange={(e) => setChooseWalletName(e.target.value)}
                      placeholder={t('Wallet Name') as string}
                      sx={{ '& .MuiInputBase-root': { borderRadius: 2, mt: 2 } }}
                    />
                    <Box sx={{width: '100%'}}>
                      <Button sx={{mt: 5}} disabled={chooseWalletName=='' ? true : false} fullWidth variant='contained' onClick={handleWalletCreateWalletData}>
                        {t("Create Wallet")}
                      </Button>
                    </Box>
                    <Box sx={{width: '100%'}}>
                      <Typography sx={{mt: 6, color: 'text.secondary'}}>{`${t(`Support Blockchain`)}`}:</Typography>
                      <Typography sx={{mt: 2, ml: 4, color: 'text.secondary'}}>1 Arweave</Typography>
                      <Typography sx={{mt: 2, ml: 4, color: 'text.secondary'}}>2 Chivesweave</Typography>
                      <Typography sx={{mt: 2, ml: 4, color: 'text.secondary'}}>3 Chivescoin</Typography>
                      <Typography sx={{mt: 2, ml: 4, color: 'text.secondary'}}>4 Chia</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Fragment>
              }

            </Grid>
          )}

          {pageModel == 'ImportKey' && (
            <Grid container spacing={2}>

              {isLoading ?
              <Fragment>
                <Grid container spacing={5}>
                    <Grid item xs={12}>
                        <Box sx={{ mt: 10, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                            <CircularProgress sx={{ mb: 4 }} />
                            <Typography sx={{mt: 3}}>{`${t(`Create a new wallet, please wait`)}`} ...</Typography>
                        </Box>
                    </Grid>
                </Grid>
              </Fragment>
              :
              <Fragment>
                <Grid item xs={12} sx={{height: 'calc(100%)'}}>
                  <Grid container spacing={2}>
                    <TextField
                      fullWidth
                      size='small'
                      value={chooseWalletName}
                      onChange={(e) => setChooseWalletName(e.target.value)}
                      placeholder={t('Wallet Name') as string}
                      sx={{ '& .MuiInputBase-root': { borderRadius: 2 }, mt: 2 }}
                    />
                    <TextField
                      multiline
                      rows={6}
                      fullWidth
                      size='small'
                      value={importKeyValue}
                      onChange={(e) => setImportKeyValue(e.target.value)}
                      placeholder={t('Wallet Json Key Content') as string}
                      sx={{ '& .MuiInputBase-root': { borderRadius: 2 }, mt: 2 }}
                    />
                    <Box sx={{width: '100%'}}>
                      <Button sx={{mt: 5}} disabled={chooseWalletName == '' || importKeyValue == '' ? true : false} fullWidth variant='contained' onClick={handleWalletImportKeyData}>
                        {t("Import Key")}
                      </Button>
                    </Box>
                    <Box sx={{width: '100%'}}>
                      <Typography sx={{mt: 6, color: 'text.secondary'}}>{`${t(`Support Blockchain`)}`}:</Typography>
                      <Typography sx={{mt: 2, ml: 4, color: 'text.secondary'}}>1 Arweave</Typography>
                      <Typography sx={{mt: 2, ml: 4, color: 'text.secondary'}}>2 Chivesweave</Typography>
                    </Box>
                  </Grid>
                </Grid>

              </Fragment>
              }

            </Grid>
          )}

          {pageModel == 'ImportMnemonic' && (
            <Grid container spacing={2}>

              {isLoading ?
              <Fragment>
                <Grid container spacing={5}>
                    <Grid item xs={12}>
                        <Box sx={{ mt: 10, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                            <CircularProgress sx={{ mb: 4 }} />
                            <Typography sx={{mt: 3}}>{`${t(`Create a new wallet, please wait`)}`} ...</Typography>
                        </Box>
                    </Grid>
                </Grid>
              </Fragment>
              :
              <Fragment>
                <Grid item xs={12} sx={{height: 'calc(100%)'}}>
                  <Grid container spacing={2}>
                    <TextField
                      fullWidth
                      size='small'
                      value={chooseWalletName}
                      onChange={(e) => setChooseWalletName(e.target.value)}
                      placeholder={t('Wallet Name') as string}
                      sx={{ '& .MuiInputBase-root': { borderRadius: 2 }, mt: 2 }}
                    />
                    <TextField
                      multiline
                      rows={2}
                      fullWidth
                      size='small'
                      value={importMnemonicValue}
                      onChange={(e) => setImportMnemonicValue(e.target.value)}
                      placeholder={t('12 or 24 mnemonic words') as string}
                      sx={{ '& .MuiInputBase-root': { borderRadius: 2 }, mt: 2 }}
                    />
                    <Box sx={{width: '100%'}}>
                      <Button sx={{mt: 5}} disabled={chooseWalletName == '' || importMnemonicValue == '' ? true : false} fullWidth variant='contained' onClick={handleWalletImportMnemonicData}>
                        {t("Import Mnemonic")}
                      </Button>
                    </Box>
                    <Box sx={{width: '100%'}}>
                      <Typography sx={{mt: 6, color: 'text.secondary'}}>{`${t(`Support Blockchain`)}`}:</Typography>
                      <Typography sx={{mt: 2, ml: 4, color: 'text.secondary'}}>1 Arweave</Typography>
                      <Typography sx={{mt: 2, ml: 4, color: 'text.secondary'}}>2 Chivesweave</Typography>
                      <Typography sx={{mt: 2, ml: 4, color: 'text.secondary'}}>3 Chivescoin</Typography>
                      <Typography sx={{mt: 2, ml: 4, color: 'text.secondary'}}>4 Chia</Typography>
                    </Box>
                  </Grid>
                </Grid>

              </Fragment>
              }

            </Grid>
          )}

          {pageModel == 'ImportJsonFile' && (
            <Grid container spacing={2}>

              {isLoading ?
              <Fragment>
                <Grid container spacing={5}>
                    <Grid item xs={12}>
                        <Box sx={{ mt: 10, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                            <CircularProgress sx={{ mb: 4 }} />
                            <Typography sx={{mt: 3}}>{`${t(`Create a new wallet, please wait`)}`} ...</Typography>
                        </Box>
                    </Grid>
                </Grid>
              </Fragment>
              :
              <Fragment>
                <Grid item xs={12} sx={{ height: 'calc(100%)' }}>
                  <Grid container spacing={2}>
                    <Box sx={{ width: '100%', mr: 2 }}>
                      <CardContent>
                        <Box {...getRootProps({ className: 'dropzone' })} sx={acceptedFiles.length ? {} : {}}>
                          <label>
                            <input {...getInputProps()} style={{ display: 'none' }} accept=".json" />
                            <Box sx={{ display: 'flex', flexDirection: ['column', 'column', 'row'], alignItems: 'center' }}>
                              <Img alt='Upload img' src='/images/misc/upload.png' />
                              <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: ['center', 'center', 'inherit'] }}>
                                <HeadingTypography variant='h5'>{`${t(`Click to choose your json file`)}`}</HeadingTypography>
                              </Box>
                            </Box>
                          </label>
                        </Box>
                      </CardContent>
                    </Box>
                    <Box sx={{width: '100%'}}>
                      <Typography sx={{mt: 6, ml: 14, color: 'text.secondary'}}>{`${t(`Support Blockchain`)}`}:</Typography>
                      <Typography sx={{mt: 2, ml: 18, color: 'text.secondary'}}>1 Arweave</Typography>
                      <Typography sx={{mt: 2, ml: 18, color: 'text.secondary'}}>2 Chivesweave</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Fragment>
              }

            </Grid>
          )}

          {pageModel == 'RenameWallet' && (
            <Grid container spacing={2}>
              <Grid item xs={12} sx={{height: 'calc(100%)'}}>
                  <Grid container spacing={2}>
                  <TextField
                    fullWidth
                    size='small'
                    value={chooseWalletName}
                    onChange={(e) => setChooseWalletName(e.target.value)}
                    placeholder={t('My Wallet') as string}
                    sx={{ '& .MuiInputBase-root': { borderRadius: 2, mt: 2 } }}
                  />
                  <Box sx={{width: '100%'}}>
                    <Button sx={{mt: 5}} fullWidth variant='contained' onClick={()=>handleWalletRenameSave()}>
                      {t("Save")}
                    </Button>
                  </Box>
                </Grid>
              </Grid>

            </Grid>
          )}

          {pageModel == 'ExportKeyHidden' && (
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'primary.main', height: '100%' }}>
                  <Box
                    position="relative"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      sx={{
                        backdropFilter: 'blur(5px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 2
                      }}
                    />
                    <TextField2
                      disabled
                      multiline
                      rows={6}
                      size="small"
                      sx={{ width: '100%', resize: 'both', '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
                  />
                  </Box>
                  <Box display="flex" justifyContent="center" alignItems="center">
                    <Button
                      sx={{ mt: 5, width: '100px' }}
                      size="small"
                      variant="outlined"
                      disabled
                      startIcon={<Icon icon='mdi:pencil' />}
                    >
                      {t("Copy")}
                    </Button>
                  </Box>

                  <TextField2
                      disabled
                      multiline
                      rows={2}
                      size="small"
                      value={''}
                      sx={{ mt: 5, width: '100%', resize: 'both', '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
                  />
                  <Box display="flex" justifyContent="center" alignItems="center">
                    <Button
                      disabled
                      sx={{ mt: 5, width: '200px' }}
                      size="small"
                      variant="outlined"
                      startIcon={<Icon icon='mdi:pencil' />}
                    >
                      {t("Copy")}
                    </Button>
                  </Box>

                  <Card sx={{mt: 5}}>
                    <Typography sx={{my: 2, pl: 2, fontWeight: 600, color: 'warning.main', textDecoration: 'none'}}>{t('Never Share Your Recovery Phrase') as string}</Typography>
                    <Typography sx={{my: 2, pl: 2, color: 'text.secondary'}}>{t('Anyone with it has full control over your wallet. Our support team will never ask for it') as string}</Typography>
                  </Card>
                  <Button sx={{mt: 5}} fullWidth variant='contained' onClick={() => handleWalletExportKeyShow()}>
                    {t("Show")}
                  </Button>

                </div>
              </Grid>
            </Grid>
          )}

          {pageModel == 'ExportKeyShow' && (
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <TextField2
                      multiline
                      rows={6}
                      size="small"
                      value={JSON.stringify(chooseWallet.jwk)}
                      sx={{ width: '100%', resize: 'both', '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
                      placeholder={t("ChannelGroup") as string}
                  />
                  <Box display="flex" justifyContent="center" alignItems="center">
                    <Button
                      sx={{ mt: 5, width: '100px' }}
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(chooseWallet.jwk));
                        toast.success(t('Copied success') as string, { duration: 1000, position: 'top-center' })
                      }}
                      startIcon={<Icon icon='mdi:pencil' />}
                    >
                      {t("Copy")}
                    </Button>
                    <Button
                      sx={{ ml: 3, mt: 5, width: '100px' }}
                      size="small"
                      variant="outlined"
                      onClick={() => handleClickToExport()}
                      startIcon={<Icon icon='mdi:pencil' />}
                    >
                      {t("Export")}
                    </Button>
                  </Box>

                  <TextField2
                      multiline
                      rows={2}
                      size="small"
                      value={chooseWallet.mnemonic}
                      sx={{ mt: 5, width: '100%', resize: 'both', '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
                      placeholder={t("Mnemonic") as string}
                  />
                  <Box display="flex" justifyContent="center" alignItems="center">
                    <Button
                      sx={{ mt: 5, width: '200px' }}
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        navigator.clipboard.writeText(chooseWallet.mnemonic);
                        toast.success(t('Copied success') as string, { duration: 1000, position: 'top-center' })
                      }}
                      startIcon={<Icon icon='mdi:pencil' />}
                    >
                      {t("Copy")}
                    </Button>
                  </Box>

                  <Card sx={{mt: 5}}>
                    <Typography sx={{my: 2, pl: 2, fontWeight: 600, color: 'warning.main', textDecoration: 'none'}}>{t('Never Share Your Recovery Phrase') as string}</Typography>
                    <Typography sx={{my: 2, pl: 2, color: 'text.secondary'}}>{t('Anyone with it has full control over your wallet. Our support team will never ask for it') as string}</Typography>
                  </Card>
                  <Button sx={{mt: 5}} fullWidth variant='contained' onClick={() => handleWalletExportKeyHidden()}>
                    {t("Hidden")}
                  </Button>

                </div>
              </Grid>
            </Grid>
          )}

          {pageModel == 'PinCode' && (
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <CheckPinKeyboard />
              </Grid>
            </Grid>
          )}

      </ContentWrapper>
      </Box>

    </Fragment>
  )
}

export default MyWallet
